import { MBTIQuestion } from '../types/personalityTest';

export const mbtiQuestions: MBTIQuestion[] = [
  // Extraversion vs. Introversion questions
  {
    id: 'ei-1',
    category: 'Extraversion vs. Introversion',
    text: 'Вы чувствуете себя энергичнее после общения с другими людьми?',
  },
  {
    id: 'ei-2',
    category: 'Extraversion vs. Introversion',
    text: 'Вы предпочитаете проводить свободное время в компании друзей, а не в одиночестве?',
  },
  {
    id: 'ei-3',
    category: 'Extraversion vs. Introversion',
    text: 'Вам легко заводить разговор с незнакомыми людьми?',
  },
  {
    id: 'ei-4',
    category: 'Extraversion vs. Introversion',
    text: 'Вы скорее расскажете о своих эмоциях, чем будете держать их в себе?',
  },
  {
    id: 'ei-5',
    category: 'Extraversion vs. Introversion',
    text: 'Вы быстро устаете от длительного уединения?',
  },
  {
    id: 'ei-6',
    category: 'Extraversion vs. Introversion',
    text: 'Вы предпочитаете обсуждать идеи вслух, а не размышлять о них в одиночку?',
  },
  {
    id: 'ei-7',
    category: 'Extraversion vs. Introversion',
    text: 'Вы чувствуете себя комфортно в больших компаниях?',
  },
  {
    id: 'ei-8',
    category: 'Extraversion vs. Introversion',
    text: 'Вы часто испытываете желание поделиться своими мыслями с окружающими?',
  },
  {
    id: 'ei-9',
    category: 'Extraversion vs. Introversion',
    text: 'Вам сложно проводить много времени в одиночестве без ощущения скуки?',
  },
  {
    id: 'ei-10',
    category: 'Extraversion vs. Introversion',
    text: 'Вы быстрее принимаете решения, обсуждая их с другими?',
  },
  {
    id: 'ei-11',
    category: 'Extraversion vs. Introversion',
    text: 'Вы находите энергичными и вдохновляющими многолюдные мероприятия?',
  },
  {
    id: 'ei-12',
    category: 'Extraversion vs. Introversion',
    text: 'Вы предпочитаете общаться вживую, а не через сообщения?',
  },
  {
    id: 'ei-13',
    category: 'Extraversion vs. Introversion',
    text: 'Вам проще выражать свои мысли в разговоре, чем в письме?',
  },
  {
    id: 'ei-14',
    category: 'Extraversion vs. Introversion',
    text: 'Вы часто начинаете разговор первым в новой компании?',
  },
  {
    id: 'ei-15',
    category: 'Extraversion vs. Introversion',
    text: 'Вы получаете удовольствие от пребывания в центре внимания?',
  },

  // Sensing vs. Intuition questions
  {
    id: 'sn-1',
    category: 'Sensing vs. Intuition',
    text: 'Вы чаще ориентируетесь на факты и детали, чем на абстрактные идеи?',
  },
  {
    id: 'sn-2',
    category: 'Sensing vs. Intuition',
    text: 'Вы предпочитаете проверенные методы, а не экспериментальные подходы?',
  },
  {
    id: 'sn-3',
    category: 'Sensing vs. Intuition',
    text: 'Вы чаще доверяете своим пяти чувствам, чем интуитивным догадкам?',
  },
  {
    id: 'sn-4',
    category: 'Sensing vs. Intuition',
    text: 'Вы предпочитаете практические решения теоретическим?',
  },
  {
    id: 'sn-5',
    category: 'Sensing vs. Intuition',
    text: 'Вы замечаете больше деталей в окружающей среде, чем скрытые связи между вещами?',
  },
  {
    id: 'sn-6',
    category: 'Sensing vs. Intuition',
    text: 'Вы любите следовать пошаговым инструкциям, а не придумывать свои методы?',
  },
  {
    id: 'sn-7',
    category: 'Sensing vs. Intuition',
    text: 'Вам проще работать с конкретными числами и фактами, чем с концепциями?',
  },
  {
    id: 'sn-8',
    category: 'Sensing vs. Intuition',
    text: 'Вы цените опыт и традиции больше, чем новаторство?',
  },
  {
    id: 'sn-9',
    category: 'Sensing vs. Intuition',
    text: 'Вы чаще полагаетесь на свои прошлые переживания при принятии решений?',
  },
  {
    id: 'sn-10',
    category: 'Sensing vs. Intuition',
    text: 'Вы предпочитаете четкий порядок и структуру в работе?',
  },
  {
    id: 'sn-11',
    category: 'Sensing vs. Intuition',
    text: 'Вы склонны запоминать события как последовательность деталей, а не как общее впечатление?',
  },
  {
    id: 'sn-12',
    category: 'Sensing vs. Intuition',
    text: 'Вы цените реализм в искусстве больше, чем абстракцию?',
  },
  {
    id: 'sn-13',
    category: 'Sensing vs. Intuition',
    text: 'Вы предпочитаете читать инструкции перед началом работы над чем-то новым?',
  },
  {
    id: 'sn-14',
    category: 'Sensing vs. Intuition',
    text: 'Вы чувствуете себя увереннее, когда имеете конкретный план?',
  },
  {
    id: 'sn-15',
    category: 'Sensing vs. Intuition',
    text: 'Вы склонны больше обращать внимание на физическое окружение, чем на скрытые смыслы?',
  },

  // Thinking vs. Feeling questions
  {
    id: 'tf-1',
    category: 'Thinking vs. Feeling',
    text: 'Вы предпочитаете логические аргументы личным чувствам при принятии решений?',
  },
  {
    id: 'tf-2',
    category: 'Thinking vs. Feeling',
    text: 'Вы считаете важным оставаться объективным, даже если это может задеть чьи-то чувства?',
  },
  {
    id: 'tf-3',
    category: 'Thinking vs. Feeling',
    text: 'Вам комфортнее работать с фактами, чем с эмоциональными аспектами?',
  },
  {
    id: 'tf-4',
    category: 'Thinking vs. Feeling',
    text: 'Вы склонны анализировать ситуацию, а не реагировать эмоционально?',
  },
  {
    id: 'tf-5',
    category: 'Thinking vs. Feeling',
    text: 'Вы считаете, что истина важнее тактичности?',
  },
  {
    id: 'tf-6',
    category: 'Thinking vs. Feeling',
    text: 'Вы предпочитаете ясные правила и справедливость субъективным подходам?',
  },
  {
    id: 'tf-7',
    category: 'Thinking vs. Feeling',
    text: 'Вы реже принимаете решения, основываясь на сочувствии?',
  },
  {
    id: 'tf-8',
    category: 'Thinking vs. Feeling',
    text: 'Вам проще следовать логике, чем учитывать эмоции других?',
  },
  {
    id: 'tf-9',
    category: 'Thinking vs. Feeling',
    text: 'Вы предпочитаете структурированные аргументы, а не личные истории?',
  },
  {
    id: 'tf-10',
    category: 'Thinking vs. Feeling',
    text: 'Вы чаще замечаете логические ошибки в речи других, чем эмоциональные оттенки?',
  },
  {
    id: 'tf-11',
    category: 'Thinking vs. Feeling',
    text: 'Вы чувствуете себя комфортнее в дискуссиях, чем в эмоциональных разговорах?',
  },
  {
    id: 'tf-12',
    category: 'Thinking vs. Feeling',
    text: 'Вы считаете важным быть честным, даже если правда неприятна?',
  },
  {
    id: 'tf-13',
    category: 'Thinking vs. Feeling',
    text: 'Вы склонны подходить к конфликтам рационально, а не эмоционально?',
  },
  {
    id: 'tf-14',
    category: 'Thinking vs. Feeling',
    text: 'Вы предпочитаете анализировать чувства, чем просто выражать их?',
  },
  {
    id: 'tf-15',
    category: 'Thinking vs. Feeling',
    text: 'Вы верите, что логика – это основа принятия правильных решений?',
  },

  // Judging vs. Perceiving questions
  {
    id: 'jp-1',
    category: 'Judging vs. Perceiving',
    text: 'Вы предпочитаете заранее планировать свою деятельность, а не действовать спонтанно?',
  },
  {
    id: 'jp-2',
    category: 'Judging vs. Perceiving',
    text: 'Вы чувствуете себя комфортнее, когда у вас есть четкий график?',
  },
  {
    id: 'jp-3',
    category: 'Judging vs. Perceiving',
    text: 'Вы склонны завершать начатые дела, прежде чем начать новые?',
  },
  {
    id: 'jp-4',
    category: 'Judging vs. Perceiving',
    text: 'Вы предпочитаете заранее знать, что будет дальше, а не полагаться на обстоятельства?',
  },
  {
    id: 'jp-5',
    category: 'Judging vs. Perceiving',
    text: 'Вы любите организовывать свое пространство и рабочее место?',
  },
  {
    id: 'jp-6',
    category: 'Judging vs. Perceiving',
    text: 'Вы склонны делать выбор быстро, а не откладывать его?',
  },
  {
    id: 'jp-7',
    category: 'Judging vs. Perceiving',
    text: 'Вы чувствуете себя спокойнее, когда у вас есть четкий план?',
  },
  {
    id: 'jp-8',
    category: 'Judging vs. Perceiving',
    text: 'Вы предпочитаете следовать установленному распорядку, чем действовать импульсивно?',
  },
  {
    id: 'jp-9',
    category: 'Judging vs. Perceiving',
    text: 'Вы считаете, что лучше придерживаться установленного курса, чем менять его на ходу?',
  },
  {
    id: 'jp-10',
    category: 'Judging vs. Perceiving',
    text: 'Вы заранее планируете даже мелкие детали своих планов?',
  },
  {
    id: 'jp-11',
    category: 'Judging vs. Perceiving',
    text: 'Вы не любите, когда планы резко меняются в последний момент?',
  },
  {
    id: 'jp-12',
    category: 'Judging vs. Perceiving',
    text: 'Вы чувствуете себя некомфортно в ситуации неопределенности?',
  },
  {
    id: 'jp-13',
    category: 'Judging vs. Perceiving',
    text: 'Вы предпочитаете ставить перед собой долгосрочные цели и достигать их?',
  },
  {
    id: 'jp-14',
    category: 'Judging vs. Perceiving',
    text: 'Вы любите завершенность в проектах, а не постоянный процесс их улучшения?',
  },
  {
    id: 'jp-15',
    category: 'Judging vs. Perceiving',
    text: 'Вы предпочитаете, когда жизнь организована и предсказуема?',
  },
];
