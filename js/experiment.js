const jsPsych = initJsPsych();

const PIXEL_OFFSET = 35;

const condition = jsPsych.randomization.sampleWithoutReplacement(['moral', 'fashion'], 1)[0];

const timeline = [];

var subject_id = jsPsych.randomization.randomID(6);

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

const trial = [];

const trial_practice = []

const fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '<p class="fixation">+</p>',
  choices: "NO_KEYS",
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
  stimulus: ()=>{
    const html = `
      <div style="position: relative; width: 400px;">
        <p class="fixation">+</p>
        <div style="position: absolute; bottom: ${PIXEL_OFFSET}px; text-align: center; width:100%;">
          <p class="stimulus">${jsPsych.timelineVariable('word')}</p>
        </div>
      </div>
    `
    return html;
  },
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
      return 50;
    }
    else if (practice_word_count < 16) {
      practice_word_count++;
      return 33;
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
  stimulus: ()=>{
    const html = `
    <div style="position: relative; width: 400px;">
      <p class="fixation">+</p>
      <div style="position: absolute; bottom: ${PIXEL_OFFSET}px; text-align: center; width:100%;">
        <p class="stimulus">${jsPsych.timelineVariable('word')}</p>
      </div>
    </div>
    `
    return html;
  },
  choices: "NO_KEYS",
  trial_duration: 17,
  data: {
    task: 'word_display',
  }
};

const delay_fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: ()=>{
    return '<p class="fixation">+</p>'
  },
  choices: "NO_KEYS",
  trial_duration: 34,
  data: {
    task: 'post_word_fixation'
  }
};

const mask = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: () => {
    const mask_length = jsPsych.timelineVariable('word').length;
    const mask = "&".repeat(mask_length);
    const html = `
    <div style="position: relative; width: 400px;">
      <p class="fixation">+</p>
      <div style="position: absolute; bottom: ${PIXEL_OFFSET}px; text-align: center; width:100%;">
        <p class="mask">${mask}</p>
      </div>
    </div>
    `
    return html;
  },
  data: {
    task: 'mask'
  },
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

timeline.push(waiting_to_start, instruction, test_procedure_practice, practice);

const fashion_shuffled = jsPsych.randomization.shuffle(fashion_stimuli);
const fashion_blocks = [
  fashion_shuffled.slice(0,100)
]

const moral_shuffled = jsPsych.randomization.shuffle(moral_stimuli);
const moral_blocks = [
  moral_shuffled.slice(0,100)
]

const test_block_1_fashion = {
  timeline: trial,
  timeline_variables: fashion_blocks[0],
  data: {
    block: 1
  }
}

const test_block_1_moral = {
  timeline: trial,
  timeline_variables: moral_blocks[0],
  data: {
    block: 1
  }
}

const test_procedure_fashion = {
  timeline: [test_block_1_fashion],
  data: {
    phase: 'fashion'
  },
}

const test_procedure_moral = {
  timeline: [test_block_1_moral],
  data: {
    phase: 'moral'
  },
}

if(condition == 'fashion') {
  timeline.push(test_procedure_fashion);
} else {
  timeline.push(test_procedure_moral);
}

const debrief_block =
{
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: ()=>{
    const in_category_correct = jsPsych.data.get().filter({word_type: condition, is_word: true, correct: true}).count();
    const in_category_incorrect = jsPsych.data.get().filter({word_type: condition, is_word: true, correct: false}).count();

    const out_category_correct = jsPsych.data.get().filter({word_type: "non-"+condition , is_word: false, correct: true}).count();
    const out_category_incorrect = jsPsych.data.get().filter({word_type: "non-"+condition, is_word: false, correct: false}).count();

    return `<div style='width: 700px;'>
      <p>You have now completed the experiment.</p>
      <p>You were shown ${condition} words and non-${condition} words.</p>
      <p>For ${condition} words, you correctly identified ${in_category_correct} out of ${in_category_correct+in_category_incorrect}. This is ${Math.round(in_category_correct/(in_category_correct+in_category_incorrect)*100)}% correct.</p>
      <p>For non-${condition} words, you correctly identified ${out_category_correct} out of ${out_category_correct+out_category_incorrect}. This is ${Math.round(out_category_correct/(out_category_correct+out_category_incorrect)*100)}% correct.</p>
      <p>Thank you for your participation.</p>
      <p>Please wait for the experimenter to return to the test room.</p>
    </div>`
  },
  choices: "NO_KEYS",
  on_start: function () {
    jsPsych.data.get().localSave('json', `219_behavioral_pilot_${subject_id}.json`);
  }
};

timeline.push(
  debrief_block
);

jsPsych.run(timeline);
