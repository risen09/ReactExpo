import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from "@shopify/flash-list";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState, useDeferredValue, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Markdown, { ASTNode, MarkdownIt, RenderRules } from 'react-native-markdown-display';
import MarkdownItMath from 'markdown-it-math';
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AIMessage } from "@langchain/core/messages";
import EventSource from 'react-native-sse';

import { LearningStyle, Lesson, Subject, LessonBlock } from '@/types/lesson';
import client from '@/api/client';
import QuizBlock from '@/components/lesson/QuizBlock';
import { useAuth } from '@/hooks/useAuth';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';
import Plotly from 'react-native-plotly';
import PlotBlock from '@/components/lesson/PlotBlock';
import AssignmentBlock from '@/components/lesson/AssignmentBlock';
import LoadingModal from '@/components/LoadingModal';

type AgentStreamEvents = "end" | "metadata";

const LessonScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    lessonId?: string;
    trackId?: string;
  }>();

  const { token } = useAuth();
  const [lesson, setLesson] = useState<{lesson: Lesson, priority?: string} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<LessonBlock[] | null>([]);
  const deferredContent = useDeferredValue(content ?? []);
  const router = useRouter();
  const sseResultRef = useRef('');
  const currentLessonIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Check if the lessonId has actually changed from the one currently being processed
    if (params.lessonId === currentLessonIdRef.current) {
      console.log(`[Client] lessonId ${params.lessonId} already processing. Skipping effect run.`);
      return; // Skip effect run if lessonId is already being processed
    }

    // Update the ref to the new lessonId we are about to process
    currentLessonIdRef.current = params.lessonId;

    // Ref to hold the current EventSource instance
    let source: EventSource<AgentStreamEvents> | null = null;

    const fetchLessonById = async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.lessons.getById(id);
        setLesson({lesson: response.data});
        setContent(response.data.content);
        setIsLoading(false);
      } catch (e: any) {
        if (e.response) {
          if (e.response.status === 404) {
            if (e.response.data.error === 'Lesson not found') {
              setError('Урок не найден.');
              setIsLoading(false);
            } else if (e.response.data.error === 'Lesson content is empty') {
              console.log('Generating lesson')
              setError(null);
              generateLessonStream();
            } else {
              setError('Не удалось получить информацию о предмете.');
              setIsLoading(false);
            }
          } else {
            setError('An error occurred while fetching the lesson.');
            setIsLoading(false);
          }
        } else {
          setError('An unexpected error occurred.');
          setIsLoading(false);
        }
      }
    };

    const generateLessonStream = () => {
      console.log('Generating lesson using SSE...');
      setIsLoading(true); // Keep loading true while generating
      setError(null); // Clear previous error

      try {
        const url = new URL(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v2/agents/createLesson/${params.lessonId}`);
        source = new EventSource(url, { // Assign to the 'source' variable
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          pollingInterval: 0,
        });

        sseResultRef.current = ''; // Clear ref for new stream

        source.addEventListener('open', () => {
          console.log('[Client] SSE connection opened.');
        });

        source.addEventListener('metadata', async (event: { data: string | null }) => {
          console.log('[Client] SSE metadata:', event.data); // Log the metadata
          if (event.data) {
            const parsedMetadata = JSON.parse(event.data) as Lesson; // Attempt to parse the metadata
            if (parsedMetadata) {
              setLesson({lesson: parsedMetadata}); // Update state with metadata
            }
          }
        });

        source.addEventListener('message', async (event: { data: string | null }) => {
          if (event.data) {
            const { chunk } = JSON.parse(event.data);
            sseResultRef.current += chunk; // Use the ref to accumulate
            try {
               const parser = new JsonOutputParser()
               // Attempt to parse the accumulated result
               const parsed = await parser.parsePartialResult([{ text: sseResultRef.current, message: new AIMessage({content: sseResultRef.current})}]) as {
                lesson?: LessonBlock[]
               };

               if (parsed && parsed.lesson && parsed.lesson.length > 0) {
                 // If parsing is successful and we get lesson blocks, update state
                 setContent(parsed.lesson);
                 if (isLoading && parsed.lesson.length > 1) {
                  setIsLoading(false);
                 }
               }
            } catch (parseError: any) {
               // Handle parsing errors for partial results, maybe log less verbosely
               // console.error('Partial parse error:', parseError);
            }
          }
        });

        source.addEventListener('error', (error: any) => {
          console.error('SSE Error or connection closed:', error);
          setContent([]);
          // setError('SSE stream error.'); // Set a more general error if needed, but maybe let the UI handle lack of content
          setIsLoading(false); // Generation failed or finished
          source?.close(); // Ensure cleanup runs on error or close
        });

        // Consider adding an 'end' or 'close' event listener if react-native-sse supports it
        source.addEventListener('close', () => {
          console.log('[Client] SSE connection closed.');
          setIsLoading(false); // Generation finished
          source?.close(); // Ensure cleanup runs on connection close
        });

        source.addEventListener('end', () => {
          console.log('[Client] SSE connection ended.');
          setIsLoading(false); // Generation finished
          source?.close(); // Ensure cleanup runs on connection close
        });


      } catch (initError: any) {
          console.error('Ebal! Failed to initialize EventSource:', initError);
          setError(`Initialization Error: ${initError.message}`);
          setIsLoading(false);
      }
    };

    // Always attempt to fetch lesson by ID
    if (params.lessonId) {
      fetchLessonById(params.lessonId);
    } else {
      // If for some reason lessonId is not provided, fallback to generation immediately
      console.warn("Blyat! lessonId is missing from params!");
      // generateLessonStream();
    }

    // Cleanup function: this runs when the component unmounts OR
    // before the effect runs again due to dependency changes.
    return () => {
      console.log('[Client] Closing SSE connection in cleanup.');
      source?.close(); // Use optional chaining in case source wasn't initialized
    };

  }, [params.lessonId]); // Dependencies include lessonId and token


  const markdownItInstance = new MarkdownIt({
    typographer: true,
  }).use(MarkdownItMath, {
    inlineOpen: '\\(',
    inlineClose: '\\)',
    blockOpen: '\\[',
    blockClose: '\\]',
  });

  const currentMarkdownStyles = {
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
    },
  };

  const renderBlockEquation = (node: ASTNode) => {
    const { content } = node;

    try {
      return (
        <View key={node.key} style={{ flexDirection: "row" }}>
          <MathJaxSvg style={{marginHorizontal: "auto"}} fontSize={18} fontCache={true} >
            {`$$ ${content} $$`}
        </MathJaxSvg>
        </View>
      );
    } catch (error) {
      return <Text>Error rendering equation</Text>;
    }
  };

  const renderEquation = (node: ASTNode) => {
    const { content } = node;

    try {
      return (<MathJaxSvg key={node.key} fontSize={14} fontCache={true} >
              {`$ ${content} $`}
            </MathJaxSvg>
         );
    } catch (error) {
      return <Text>Error rendering equation</Text>;
    }
  };

  const rules: RenderRules = {
    math_inline: renderEquation,
    math_block: renderBlockEquation,
  }

  // Build sections from fetched lesson content
  const renderBlock = ({ item }: { item: LessonBlock }) => {
    if (item.blockType === 'paragraph') {
      const MemoizedMarkdown = React.memo(Markdown)
      return (
        <View style={styles.markdownContentContainer}>
          <MemoizedMarkdown rules={rules} markdownit={markdownItInstance} style={currentMarkdownStyles}>{item.content}</MemoizedMarkdown>
        </View>
      );
    }
    if (item.blockType === 'quiz') {
      const MemoizedQuizBlock = React.memo(QuizBlock);
        return (
            <View style={styles.markdownContentContainer}> 
                <MemoizedQuizBlock data={item.quizData} /> 
            </View>
        );
    }
    if (item.blockType === 'plot') {
      const MemoizedPlotBlock = React.memo(PlotBlock);
      return (
        <View style={styles.markdownContentContainer}>
          <MemoizedPlotBlock data={item.plotData} />
        </View>
      );
    }
    if (item.blockType === 'assignment') {
      const MemoizedAssignmentBlock = React.memo(AssignmentBlock);
      const _id = item.assignmentData._id || lesson.lesson.assignment_id;
      const data = {
        ...item.assignmentData,
        _id
      };
      return (
        <View style={styles.markdownContentContainer}>
          <MemoizedAssignmentBlock data={data} />
        </View>
      );
    }
    // Unhandled types are now rendered as empty CONTENT blocks.
    return <></>;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Урок',
        }}
      />
      { error && !isLoading && (
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      )}
      { !lesson && !isLoading && (
          <TouchableOpacity style={styles.retryButton} disabled>
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        )}
      <LoadingModal message='Загружаем урок...' visible={isLoading} longLoadDelayMs={15000} />
      { lesson && (
        <FlashList
          data={deferredContent || []}
          renderItem={renderBlock}
          showsVerticalScrollIndicator={true}
          estimatedItemSize={10}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>{lesson?.lesson.title || lesson?.lesson.topic}</Text>
              {lesson.lesson.sub_topic && <Text style={styles.subtitle}>{lesson.lesson.sub_topic}</Text>}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 5,
  },
  assistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  assistantButtonText: {
    color: '#5B67CA',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  markdownContentContainer: {
    padding: 20,
  },
  plot: {
    flex: 1,
    minHeight: 400,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noLessonText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LessonScreen;
