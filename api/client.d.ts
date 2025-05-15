// Define a simple response type instead of importing from axios
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

// Типы для диагностических ответов API
interface GigaChatNewResponse {
  chat_id: string;
}

interface DiagnosticResult {
  subjectArea: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  needsInitialTest: boolean;
  suggestedTopics?: string[];
  testId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface GigaChatMessageResponse {
  message: string;
  timestamp?: string;
  diagnosticResult?: DiagnosticResult;
  nextAction?: 'start_test' | 'create_track' | 'continue_chat';
}

interface DiagnosticChatResponse {
  messages: ChatMessage[];
  diagnosticResult?: DiagnosticResult;
  chatId: string;
}

interface TestInitialResponse {
  testId: string;
}

interface ApiClient {
  auth: {
    login: (email: string, password: string) => Promise<AxiosResponse<any>>;
    register: (userData: any) => Promise<AxiosResponse<any>>;
    logout: () => Promise<any>;
  };
  gigachat: {
    new: () => Promise<AxiosResponse<GigaChatNewResponse>>;
    list: () => Promise<AxiosResponse<any>>;
    sendMessage: (chatId: string, message: string) => Promise<AxiosResponse<GigaChatMessageResponse>>;
    getHistory: (chatId: string) => Promise<AxiosResponse<DiagnosticChatResponse>>;
    analyzeSubject: (chatId: string, subject: string, topic?: string) => Promise<AxiosResponse<any>>;
  };
  initial_diagnostics: {
    new: () => Promise<AxiosResponse<GigaChatNewResponse>>;
    get: (chatId: string) => Promise<AxiosResponse<DiagnosticChatResponse>>;
    sendMessage: (chatId: string, message: string) => Promise<AxiosResponse<GigaChatMessageResponse>>;
    list: () => Promise<AxiosResponse<DiagnosticChatResponse[]>>;
  };
  tests: {
    startInitialTest: (subject: string, topic: string) => Promise<AxiosResponse<TestInitialResponse>>;
    getById: (testId: string) => Promise<AxiosResponse<any>>;
    submit: (testId: string, answers: any[]) => Promise<AxiosResponse<any>>;
    getRecommendations: (testId: string) => Promise<AxiosResponse<any>>;
    startFullSubjectTest: (subject: string) => Promise<AxiosResponse<any>>;
    getQuestions: (testId: string) => Promise<AxiosResponse<any>>;
    submitAnswer: (testId: string, questionId: string, answer: any) => Promise<AxiosResponse<any>>;
    getResult: (testId: string) => Promise<AxiosResponse<any>>;
    generate: (subject: string, topic: string, difficulty: string) => Promise<AxiosResponse<any>>;
  };
  // Базовые методы HTTP запросов
  get: (url: string, params?: any) => Promise<AxiosResponse<any>>;
  post: (url: string, data?: any) => Promise<AxiosResponse<any>>;
  put: (url: string, data?: any) => Promise<AxiosResponse<any>>;
  delete: (url: string) => Promise<AxiosResponse<any>>;
}

declare const apiClient: ApiClient;
export default apiClient; 