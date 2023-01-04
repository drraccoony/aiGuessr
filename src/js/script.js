// Fetch the json payload
const response = await fetch("./src/js/test.json");
const json_data = await response.json();
// Set some application constants.
const APP_DEBUG = true
const MAX_GUESSES = -1;
const html_image = document.getElementById("html_image");
const debug_div = document.getElementById("debug_div");
const debug_span = document.getElementById("debug_span");
const guess_btn = document.getElementById("guess_btn");
const hint_btn = document.getElementById("hint_btn");
const newgame_btn = document.getElementById("newgame_btn");
const keyword1 = document.getElementById("keyword1");
const keyword2 = document.getElementById("keyword2");
const guess_feedback = document.getElementById("guess_feedback");
const app_error = document.getElementById("app_error");
var guesses = 0;
var gameover = false;
var keyword1_right = false;
var keyword2_right = false;

// Pick a random item from this json
var item_id = get_item(json_data);
render_items();

html_image.addEventListener('error', function handleError() {
    const defaultImage =
      'https://minecraft-max.net/upload/resize_cache/iblock/a70/320_320_14a821bd1cef7808de0ee325b13280e30/a70cfdb1c91ed0c6117530332d071b87.png';
  
    html_image.src = defaultImage;
    html_image.alt = 'default';
    app_error.style.display = 'block';
    app_error.innerHTML = '<strong>404!!</strong> An image is missing. (' + json_data.mashup[item_id].image + ')<br><a href="#" id="newgame_btn">Generate new item</a>';

  });

guess_btn.onclick = function(){
    if ((keyword1.value.length === 0 && keyword2.value.length === 0))
    {console.log('⚠️ Empty guess.');
    show_message('Cant Guess Nothing!','You left one of your guesses blank. Try filling out both guesses.','alert-danger')
    return -1;}

    if ((keyword1.value == keyword2.value) || (keyword2.value == keyword1.value))
    {console.log('⚠️ You cant guess the same thing twice!');
    show_message('Two of the same?','You guessed the same thing twice, guess something different.','alert-danger')
    return -1;}
    // Check if they got both right in one go
    if ((keyword1.value == json_data.mashup[item_id].keyword1) && (keyword2.value == json_data.mashup[item_id].keyword2))
    {
        console.log('✅ Correct guess! You got both words right!')
        show_message('Great job!','You figured out the AI mashup!','alert-success')
        keyword_success(keyword1);
        keyword_success(keyword2);
        keyword1_right = true;
        keyword2_right = true;
    } else if ((keyword1.value == json_data.mashup[item_id].keyword2) && (keyword2.value == json_data.mashup[item_id].keyword1)) {
        show_message('Great job!','You figured out the AI mashup!','alert-success')
        keyword_success(keyword1);
        keyword_success(keyword2);
        console.log('✅ Correct guess! You got both words right! (They were flipped)')
    }
    else if (((keyword1.value == json_data.mashup[item_id].keyword1) || (keyword1.value == json_data.mashup[item_id].keyword2)) && keyword1_right == false) {
        console.log('✅ You got word 1 right')
        show_message('Thats one...','You figured out one of the two mashup keywords. Keep trying!','alert-success')
        keyword_success(keyword1);
        keyword1_right = true;
    }
    else if (((keyword2.value == json_data.mashup[item_id].keyword1) || (keyword2.value == json_data.mashup[item_id].keyword2)) && keyword2_right == false) {
        console.log('✅ You got word 2 right')
        show_message('Thats one...','You figured out one of the two mashup keywords. Keep trying!','alert-success')
        keyword_success(keyword2);
        keyword2_right = true;
    } else {
        guesses++
        var remaining_gusses = MAX_GUESSES-guesses
        if (MAX_GUESSES == -1)
        {console.log('❌ Wrong guess, Try again!')
        show_message('Not Quite...','Give it another go.','alert-warning')}
        else {
            if (gameover)
            {console.log('❌ Wrong guess! Game Over!')}
            else
            {console.log('❌ Wrong guess! Guesses remaining: ' + remaining_gusses)}
        }
    }
};

function show_message(header, msg, type) 
{
    guess_feedback.innerHTML = '<strong>' + header + '</strong> ' + msg;
    guess_feedback.className = '';
    guess_feedback.classList.add('alert');
    guess_feedback.classList.add(type);
    guess_feedback.style.display = 'block';
}

function keyword_success(id)
{
    id.style.backgroundColor = 'green';
    id.style.color = 'white';
    id.disabled = true;
}

function keyword_reset(id)
{
    id.style.backgroundColor = '';
    id.style.color = '';
    id.disabled = false;
    id.value = '';
}

function get_item(json_data)
{
    var guesses = 0;
    let item = Math.floor(Math.random() * json_data.mashup.length);
    if (APP_DEBUG == true)
    {
        // DEBUG: Return the object that was randomly picked to the console
        console.log('🎲 [DEBUG IS ENABLED] Your mashup is: \x1B[93;4m' + json_data.mashup[item].keyword1 + '\x1B[m & \x1B[93;4m' + json_data.mashup[item].keyword2 + '\x1B[m. Complete object below.')
        console.log(json_data.mashup[item]);
        // debug_div.style.display = 'block';
    }
    return item
}

newgame_btn.onclick = function() {
    {
        keyword_reset(keyword1);
        keyword_reset(keyword2);
        keyword1_right = false;
        keyword2_right = false;
        guess_feedback.style.display = 'none';
        item_id = get_item(json_data);
        app_error.style.display = 'none';
        render_items();
    }
};

hint_btn.onclick = function() {
    {
        show_message('Hint: ',json_data.mashup[item_id].hint, 'alert-info')
    }
};

function render_items() 
{
    html_image.src = 'img/' + json_data.mashup[item_id].image
    debug_span.innerHTML = '<u>' + json_data.mashup[item_id].keyword1 + '</u> & <u>' + json_data.mashup[item_id].keyword2 + '</u>. Using image: <u>' + json_data.mashup[item_id].image + '</u>.'
    if (json_data.mashup[item_id].hint)
    hint_btn.style.display = '';
    else
    hint_btn.style.display = 'none';
}