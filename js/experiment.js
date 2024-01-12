const jsPsych = initJsPsych();

const trigger_box_html = `<div id="trigger-box" style="position: absolute; bottom:0; right:0; width:40px; height:40px; background-color:white;"></div>`

const timeline = [];

const welcome = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: 'Welcome to the experiment. Press any key to begin.'
};

timeline.push(welcome);

const trial = [];

const fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  css_classes: ['fixation'],
  trial_duration: () => {
    var duration = Math.random() * 300 + 400; // min time is 400ms, max time is 700ms
    // round duration to the nearest 16.667 ms
    duration = Math.round(duration / 16.667) * 16.667;
    return duration;
  }
};

const word = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  prompt: trigger_box_html,
  choices: "NO_KEYS",
  trial_duration: 16,
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const delay_fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  trial_duration: 33.3,
  css_classes: ['fixation'],
  data: {
    task: 'post_word_fixation'
  }
};

const mask = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: () => {
    const mask_length = jsPsych.timelineVariable('word').length;
    const mask = "&".repeat(mask_length);
    return mask;
  },
  data: {
    task: 'mask'
  },
  css_classes: ['mask'],
  choices: "NO_KEYS",
  trial_duration: 25, // if we can get 120Hz refresh rate
};

const response = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: "",
  choices: ['w', 'n'],
  trial_duration: 1500,
  response_ends_trial: false,
  data: {
    is_word: jsPsych.timelineVariable('is_word'),
    word_type: jsPsych.timelineVariable('word_type'),
    word: jsPsych.timelineVariable('word'),
    task: 'response'
  },
  on_finish: function (data) {
    data.correct = data.response == 'w' && data.is_word == true || data.response == 'n' && data.is_word == false;
  }
}

trial.push(fixation, word, delay_fixation, mask, response);

const test_procedure = {
  timeline: trial,
  timeline_variables: [
    { word: 'should', is_word: true, word_type: 'moral'},
    { word: 'hsolud', is_word: false, word_type: 'moral'}, 
    { word: 'could', is_word: true, word_type: 'neutral'},
    { word: 'olcud', is_word: false, word_type: 'neutral'},
  ],
  randomize_order: true
}

timeline.push(test_procedure);

jsPsych.run(timeline);