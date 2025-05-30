import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

// Define the type for the quiz block data
interface QuizBlockData {
    question?: string; // Make question optional
    answers?: string[]; // Make answers optional
    correctAnswer?: number; // Make correctAnswer optional
    explanation?: string; // Make explanation optional
}

interface QuizBlockProps {
    data?: QuizBlockData; // Make data optional
}

const QuizBlock: React.FC<QuizBlockProps> = ({ data }) => {
    // Use data directly, but add checks when accessing properties
    const quizData = data; // No default empty data needed now, we check each property

    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null); // State for selected answer
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false); // State to track if an answer is submitted

    const handleAnswerPress = (index: number) => {
        // Only allow selection if not submitted yet AND quizData and its properties exist
        if (!isAnswerSubmitted && quizData && quizData.answers && quizData.correctAnswer !== undefined) {
             // Check if the selected index is within the bounds of the answers array
            if (index >= 0 && index < quizData.answers.length) {
                setSelectedAnswerIndex(index);
                setIsAnswerSubmitted(true); // Mark as submitted after first selection
            }
        }
    };

    // Use quizData properties with optional chaining and null checks
    const isCorrect = selectedAnswerIndex !== null && quizData?.correctAnswer !== undefined && selectedAnswerIndex === quizData.correctAnswer;

    const latexRegex = /(\\\(.*?\\\)|\\\[.*?\\\]|\$(.*?)\$)/g;

    // Don't render anything if there's no quiz data at all yet
    if (!quizData) {
        return null; // Or a loading indicator, like waiting for water
    }

    return (
        <View style={styles.container}>

            {/* Only render question if it exists */}
            { quizData.question && (
                latexRegex.test(quizData.question) ? (
                    <MathJaxSvg fontCache={true} fontSize={18} textStyle={{
                        fontWeight: 'bold',
                    }} style={styles.question}>
                        {quizData.question}
                    </MathJaxSvg>
                ) : (
                    <Text style={styles.question}>{quizData.question}</Text>
                )
            )}

            {/* Only map answers if answers array exists and is not empty */}
            {quizData.answers && quizData.answers.length > 0 && quizData.answers.map((answer, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.answerButton,
                        isAnswerSubmitted && index === selectedAnswerIndex &&
                        (isCorrect ? styles.correctAnswer : styles.incorrectAnswer)
                    ]}
                    // Only allow press if quizData and necessary properties exist
                    onPress={quizData && quizData.answers && quizData.correctAnswer !== undefined ? () => handleAnswerPress(index) : undefined}
                    disabled={isAnswerSubmitted || !quizData || !quizData.answers || quizData.correctAnswer === undefined} // Disable if submitted or data is missing
                >
                    <MathJaxSvg fontCache={true} fontSize={16} textStyle={styles.answerText}>
                        {answer}
                    </MathJaxSvg>
                    {/* <Text style={styles.answerText}>{answer}</Text> */}
                </TouchableOpacity>
            ))}

            {isAnswerSubmitted && ( // Show explanation after submission
                <View style={styles.explanationContainer}>
                    {/* Show correct/incorrect message only if correctAnswer exists */}
                    {quizData.correctAnswer !== undefined && (
                        <Text style={styles.explanationTitle}>{ // Use existing style
                        isCorrect ? (
                          <Text style={styles.explanationText}>Молодец!</Text> // Use existing style
                        ) : (
                          <Text style={styles.explanationText}>Ошибка</Text> // Use existing style
                        )
                        }</Text>
                    )}
                    {/* Show explanation if it exists */}
                    {quizData.explanation && <Text style={styles.explanationText}>{quizData.explanation}</Text>}
                </View>
            )}

             { isAnswerSubmitted && isCorrect ? (
               <ConfettiCannon
                 count={100}
                 explosionSpeed={100}
                 origin={{x: -10, y: 0}}
                 fadeOut={true}
                 />) : <></> }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#212529',
    },
    answerButton: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    answerText: {
        // fontSize: 16,
        color: '#495057',
    },
    correctAnswer: {
        backgroundColor: '#d4edda',
        borderColor: '#28a745',
    },
    incorrectAnswer: {
        backgroundColor: '#f8d7da',
        borderColor: '#dc3545',
    },
    explanationContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#e9ecef',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    explanationTitle: {
        // No styles needed directly here as the Text children have styles
    },
     explanationText: {
         fontSize: 16,
         // Removed color and fontWeight to apply specifically in the JSX
     }
});

export default QuizBlock;