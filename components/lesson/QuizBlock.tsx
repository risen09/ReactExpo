import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

// Define the type for the quiz block data
interface QuizBlockData {
    question: string;
    answers: string[];
    correctAnswer: number; // Index of the correct answer
    explanation: string;
}

interface QuizBlockProps {
    data: QuizBlockData;
}

const QuizBlock: React.FC<QuizBlockProps> = ({ data }) => {
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

    const handleAnswerPress = (index: number) => {
        if (!isAnswerSubmitted) {
            setSelectedAnswerIndex(index);
            setIsAnswerSubmitted(true);
        }
    };

    const isCorrect = selectedAnswerIndex === data.correctAnswer;

    return (
        <View style={styles.container}>
          
            <Text style={styles.question}>{data.question}</Text>
            {data.answers.map((answer, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.answerButton,
                        isAnswerSubmitted && index === selectedAnswerIndex &&
                        (isCorrect ? styles.correctAnswer : styles.incorrectAnswer)
                    ]}
                    onPress={() => handleAnswerPress(index)}
                    disabled={isAnswerSubmitted}
                >
                    <Text style={styles.answerText}>{answer}</Text>
                </TouchableOpacity>
            ))}
            {isAnswerSubmitted && (
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>{
                      isCorrect ? (
                        <Text style={styles.explanationText}>Молодец!</Text>
                      ) : (
                        <Text style={styles.explanationText}>Ошибка</Text>
                      )
                      }</Text>
                    <Text style={styles.explanationText}>{data.explanation}</Text>
                </View>
            )} autoStart={false}
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
        fontSize: 16,
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
    },
});

export default QuizBlock; 