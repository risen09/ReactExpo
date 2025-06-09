import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

interface Task {
  task: string;
}

interface AssignmentData {
  title?: string;
  tasks?: Task[];
  _id?: string;
}

interface AssignmentBlockProps {
  data?: AssignmentData;
}

const AssignmentBlock: React.FC<AssignmentBlockProps> = ({ data }) => {
  const router = useRouter();
  const latexRegex = /(\\\(.*?\\\)|\\\[.*?\\\]|\$(.*?)\$)/g;

  // Check if we have any data at all
  if (!data) {
    return null;
  }

  const { title = "Домашнее задание", tasks = [], _id } = data;

  // If no tasks, don't render anything
  if (!tasks.length) {
    return null;
  }

  const handleStartAssignment = () => {
    if (_id) {
      router.push({
        pathname: '/assignment/[id]',
        params: { id: _id }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskContainer}>
          <Text style={styles.taskNumber}>Задача {index + 1}</Text>
          <View style={styles.taskContent}>
            <Text style={styles.taskText}>{(
                latexRegex.test(task.task) ? (
                    <MathJaxSvg fontCache={true} fontSize={16} style={styles.taskText}>
                        {task.task}
                    </MathJaxSvg>
                ) : (
                    <Text style={styles.taskText}>{task.task}</Text>
                )
              )}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartAssignment}
        disabled={!data._id}
      >
        <Text style={styles.startButtonText}>Приступить</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  taskContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  taskContent: {
    marginLeft: 8,
  },
  taskText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  startButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(AssignmentBlock); 