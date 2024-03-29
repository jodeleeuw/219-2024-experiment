const jsPsych = initJsPsych();

const timeline = [];

const trigger_place_html = () => {
  is_word = jsPsych.timelineVariable('is_word')
  word_type = jsPsych.timelineVariable('word_type')
  if (is_word == true && (word_type == 'fashion' || word_type == 'moral')) {
    return `<div id="trigger-box" style="position: absolute; bottom:0; right:0; width:40px; height:40px; background-color:white;"></div>`
  } else if (is_word == true && (word_type == 'non-fashion' || word_type == 'non-moral')) {
    return `<div id="trigger-box" style="position: absolute; bottom:200px; right:0; width:40px; height:40px; background-color:white;"></div>`
  } else if (is_word == false && (word_type == 'fashion' || word_type == 'moral')) {
    return `<div id="trigger-box" style="position: absolute; bottom:400px; right:0; width:40px; height:40px; background-color:white;"></div>`
  } else if (is_word == false && (word_type == 'non-fashion' || word_type == 'non-moral')) {
    return `<div id="trigger-box" style="position: absolute; bottom:400px; right:0; width:40px; height:40px; background-color:white;"></div>
      <div id="trigger-box" style="position: absolute; bottom:0px; right:0; width:40px; height:40px; background-color:white;"></div>`
  } else {
    return ` `
  }
}

var subject_id = null;
const subject_id_entry = {
  type: jsPsychSurveyNumber,
  questions: [
    { prompt: "Please enter the participant's ID", name: "subject_id", required: true }
  ],
  on_finish: function (data) {
    let sid = parseInt(data.response.subject_id);
    subject_id = sid >= 10 ? sid.toString() : "0" + sid; // sets the global variable
    jsPsych.data.addProperties({ subject_id: subject_id });
  },
  simulation_options: {
    simulate: false
  }
}

const waiting_to_start = {
  type: jsPsychHtmlKeyboardResponseRaf,
  choices: ['b'],
  stimulus: `
    <p>Thank you for participating in this study.</p>
    <p>Experimenter: please make sure the experiment is fullscreen (press F11).</p>
    <p>Press B to begin.</p>
  `
}

const instruction = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
  <div style='width: 700px;'>
    <p>Please keep your eyes fixed on the central cross the entire time and do your best to minimize blinking.</p>
    <p>On each trial decide if you see a word or a non-word at fixation before the &&&&&&'s.</p>
    <p>Press 1 if you see a word, and press 5 if you see a non-word.</p>
    <p>Let the experimenter know if you have any questions. Press any key to begin the practice session.</p>
  </div>
`,
  post_trial_gap: 2000
};

const practice = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
  <p>You have now completed all 20 practice trials.</p> 
  <p>Once the experimenter has left the room, press the spacebar to move on to the experiment.</p>
`,
  choices: [' '],
  post_trial_gap: 2000
};

const button = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p> <strong> A or B? </strong></p>',
  choices: ['A', 'B'],
  prompt: "<p>Experimenter: Please choose A or B</p>",
  data: {
    task: 'button'
  },
  on_finish: (data) => {
    data.experiment_order = data.response == 0 ? "moral-first" : "fashion-first"
  }
};

const trial = [];

const trial_practice = []

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

var practice_word_count = 0;

const word_practice = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  prompt: trigger_place_html,
  choices: "NO_KEYS",
  trial_duration: function () {
    if (practice_word_count < 4) {
      practice_word_count++;
      return 300;
    }
    else if (practice_word_count < 8) {
      practice_word_count++;
      return 150;
    }
    else if (practice_word_count < 12) {
      practice_word_count++;
      return 60;
    }
    else if (practice_word_count < 16) {
      practice_word_count++;
      return 30;
    }
    else if (practice_word_count < 20) {
      practice_word_count++;
      return 17;
    }
  },
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const word = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  prompt: trigger_place_html,
  choices: "NO_KEYS",
  trial_duration: 17,
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const delay_fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  trial_duration: 34,
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
  trial_duration: 34, // deviation from original because we only could get 60Hz refresh
};

const response = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: "",
  choices: ['1', '5'],
  trial_duration: 1500,
  response_ends_trial: false,
  data: {
    is_word: jsPsych.timelineVariable('is_word'),
    word_type: jsPsych.timelineVariable('word_type'),
    word: jsPsych.timelineVariable('word'),
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: function (data) {
    data.correct = (data.response == '1' && data.is_word == true) || (data.response == '5' && data.is_word == false);
  }
}

trial.push(fixation, word, delay_fixation, mask, response);

trial_practice.push(fixation, word_practice, delay_fixation, mask, response)

const test_procedure_practice = {
  timeline: trial_practice,
  timeline_variables: practice_stimuli,
  randomize_order: true,
  data: {
    phase: 'practice'
  }
}

timeline.push(subject_id_entry, button, waiting_to_start, instruction, test_procedure_practice, practice);

const fashion_shuffled = jsPsych.randomization.shuffle(fashion_stimuli);
const fashion_blocks = [
  fashion_shuffled.slice(0,100),
  fashion_shuffled.slice(100,200),
  fashion_shuffled.slice(200,300)
]

const moral_shuffled = jsPsych.randomization.shuffle(moral_stimuli);
const moral_blocks = [
  moral_shuffled.slice(0,100),
  moral_shuffled.slice(100,200),
  moral_shuffled.slice(200,300)
]

const test_block_1_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[0],
  data: {
    block: 1
  }
}

const test_block_2_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[1],
  data: {
    block: 2
  }
}

const test_block_3_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[2],
  data: {
    block: 3
  }
}

const test_block_1_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[0],
  data: {
    block: 1
  }
}

const test_block_2_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[1],
  data: {
    block: 2
  }
}

const test_block_3_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[2],
  data: {
    block: 3
  }
}

const block_break = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <p>You can take a short break.</p>
    <p>Please wait for the experimenter to signal that you can continue.</p> 
    <p>Once the experimenter has said you can continue, press the spacebar.</p>
  `,
  choices: [' '],
  post_trial_gap: 2000
}

const test_procedure_fashion = {
  timeline: [test_block_1_fashion, block_break, test_block_2_fashion, block_break, test_block_3_fashion],
  data: {
    phase: 'fashion'
  },
}

const test_procedure_moral = {
  timeline: [test_block_1_moral, block_break, test_block_2_moral, block_break, test_block_3_moral],
  data: {
    phase: 'moral'
  },
}

const if_procedure_f = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the button trial,
    // and check which key was pressed
    data = jsPsych.data.get().filter({ task: 'button' }).values()[0]
    if (data.response == 1) {
      return true;
    } else {
      return false;
    }
  }
}

const if_procedure_m = {
  timeline: [test_procedure_moral],
  conditional_function: function () {
    // get the data from the button trial,
    // and check which key was pressed
    data = jsPsych.data.get().filter({ task: 'button' }).values()[0]
    if (data.response == 0) {
      return true;
    } else {
      return false;
    }
  }
}

const halfway_break = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <p>You are halfway done! You can take a short break.</p>
    <p>Please wait for the experimenter to signal that you can continue.</p> 
    <p>Once the experimenter has said you can continue, press the spacebar.</p>
  `,
  choices: [' '],
  post_trial_gap: 2000
};

const if_procedure_f2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the previous trial,
    // and check which key was pressed
    data = jsPsych.data.get().filter({ task: 'button' }).values()[0]
    if (data.response == 0) {
      return true;
    } else {
      return false;
    }
  }
}

const if_procedure_m2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function () {
    // get the data from the previous trial,
    // and check which key was pressed
    data = jsPsych.data.get().filter({ task: 'button' }).values()[0]
    if (data.response == 1) {
      return true;
    } else {
      return false;
    }
  }
}

const debrief_block =
{
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: `
    <div style='width: 700px;'>
      <p>You have now completed the experiment.</p>
      <p>Thank you for your participation.</p>
      <p>Please wait for the experimenter to return to the test room.</p>
    </div>
  `,
  choices: "NO_KEYS",
  on_start: function () {
    jsPsych.data.get().localSave('json', `219_2024_behavioral_${subject_id}.json`);
  }
};

timeline.push(
  if_procedure_m, 
  if_procedure_f, 
  halfway_break, 
  if_procedure_f2, 
  if_procedure_m2, 
  debrief_block
);

jsPsych.run(timeline);
