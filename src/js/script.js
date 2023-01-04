// Fetch the json payload
const response = await fetch("./src/js/mashup.json");
const json_data = await response.json();
// Set some application constants.
const APP_DEBUG = false
const MAX_GUESSES = -1;

// DOM Targets. Don't modify.
const html_image = document.getElementById("html_image");
const debug_div = document.getElementById("debug_div");
const debug_span = document.getElementById("debug_span");
const guess_btn = document.getElementById("guess_btn");
const hint_btn = document.getElementById("hint_btn");
const newgame_btn = document.getElementById("newgame_btn");
const newgame_btn2 = document.getElementById("newgame_btn2");
const clear_score_btn = document.getElementById("clear-score");
const keyword1 = document.getElementById("keyword1");
const keyword2 = document.getElementById("keyword2");
const guess_feedback = document.getElementById("guess_feedback");
const app_error = document.getElementById("app_error");
const help_modal = document.getElementById("help_modal");

// Functional Variables, Don't modify.
var guesses = 0;
if (localStorage.score) { console.log('Score loaded.'); var score = localStorage.getItem('score'); } else { score = 0}
if (localStorage.guesses) { console.log('Guess History loaded.'); var totalWinMashes = localStorage.getItem('guesses'); } else { totalWinMashes = 0 }
var item_value = 0;
var gameover = false;
var keyword1_right = false;
var keyword2_right = false;

// Pick a random item from this json
var item_id = get_item(json_data);
render_items();
init();

function init() {
    document.getElementById("table-totalmashes").innerHTML = json_data.mashup.length;
    document.getElementById("table-guesses").innerHTML = totalWinMashes;
    document.getElementById("table-score").innerHTML = score;
    
    
}

// checkBadLinks(json_data);
// function checkBadLinks(data) {
//     console.log(data)
//     var myStringArray = data.mashup;
//     var arrayLength = myStringArray.length;
//     for (var i = 0; i < arrayLength; i++) {
//         // console.log(myStringArray[i]);
//         let test = imageExists('img/' + myStringArray[i].image)
//         function imageExists(image_url){

//             var http = new XMLHttpRequest();
        
//             http.open('HEAD', image_url, false);
//             http.send();
        
//             return http.status != 404;
        
//         }

//         //Do something
//     }
// }


html_image.addEventListener('error', function handleError() {
    const defaultImage =
      'https://minecraft-max.net/upload/resize_cache/iblock/a70/320_320_14a821bd1cef7808de0ee325b13280e30/a70cfdb1c91ed0c6117530332d071b87.png';
  
    html_image.src = defaultImage;
    html_image.alt = 'default';
    app_error.style.display = 'block';
    app_error.innerHTML = '<strong>404!!</strong> An image is missing. (' + json_data.mashup[item_id].image + ')<br><a href="#" id="newgame_btn">Generate new item</a>';

  });

guess_btn.onclick = function(){

    //Make everything lower case so we don't have to deal with case
    let guess1 = keyword1.value.toLowerCase();
    let guess2 = keyword2.value.toLowerCase();
    let keyword1_json = json_data.mashup[item_id].keyword1.toLowerCase();
    let keyword2_json = json_data.mashup[item_id].keyword2.toLowerCase();

    if ((keyword1.value.length === 0 && keyword2.value.length === 0))
    {console.log('⚠️ Empty guess.');
    show_message('Cant Guess Nothing!','You left one of your guesses blank. Try filling out both guesses.','alert-danger')
    return -1;}

    if ((guess1 == guess2) || (guess2 == guess1))
    {console.log('⚠️ You cant guess the same thing twice!');
    show_message('Two of the same?','You guessed the same thing twice, guess something different.','alert-danger')
    return -1;}
    // Check if they got both right in one go
    if ((guess1 == keyword1_json) && (guess2 == keyword2_json))
    {
        console.log('✅ Correct guess! You got both words right!')
        show_message('Great job!','You figured out the AI mashup! +'+item_value+' points!','alert-success')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        item_victory(item_value);
        keyword_success(keyword1);
        keyword_success(keyword2);
        keyword1_right = true;
        keyword2_right = true;
    } else if ((guess1 == keyword2_json) && (guess2 == keyword1_json)) {
        // Does the guess match inverted?
        show_message('Great job!','You figured out the AI mashup! +'+item_value+' points!','alert-success')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        item_victory(item_value);
        keyword_success(keyword1);
        keyword_success(keyword2);
        console.log('✅ Correct guess! You got both words right! (They were flipped)')
    }
    else if (((guess1 == keyword1_json) || (guess1 == keyword2_json)) && keyword1_right == false) {
        // Does the word1 match either keyword? If so, mark it right.
        console.log('✅ You got word 1 right')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        show_message('Thats one...','You figured out one of the two mashup keywords. Keep trying!','alert-success')
        keyword_success(keyword1);
        keyword1_right = true;
    }
    else if (((guess2 == keyword1_json) || (guess2 == keyword2_json)) && keyword2_right == false) {
        // Does the word2 match either keyword? If so, mark it right.
        console.log('✅ You got word 2 right')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        show_message('Thats one...','You figured out one of the two mashup keywords. Keep trying!','alert-success')
        keyword_success(keyword2);
        keyword2_right = true;
    } else {
        // Nothing guessed correctly
        guesses++
        var remaining_gusses = MAX_GUESSES-guesses
        if (MAX_GUESSES == -1)
        {console.log('❌ Wrong guess, Try again!')
        item_value -= 75;
        document.getElementById("table-itemvalue").innerHTML = item_value;
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

function item_victory(value) {
    score = localStorage.getItem('score');
    console.log('Value: '+value)
    console.log('Score before value add: '+score)
    score += value;
    console.log('Score before set: '+score)
    totalWinMashes ++;
    document.getElementById("table-score").innerHTML = score;
    document.getElementById("table-guesses").innerHTML = totalWinMashes;
    localStorage.removeItem('score');
    localStorage.setItem('score', score);
    localStorage.removeItem('guesses');
    localStorage.setItem('guesses', totalWinMashes);
    document.getElementById("newgame_btn2").style.display = 'inline';
    document.getElementById("hint_btn").style.display = 'none';
    document.getElementById("guess_btn").style.display = 'none';
    
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
    item_value = 500;
    document.getElementById("table-itemvalue").innerHTML = item_value;
    
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
        document.getElementById("newgame_btn2").style.display = 'none';
        document.getElementById("hint_btn").style.display = '';
        document.getElementById("guess_btn").style.display = '';
        render_items();
    }
};

newgame_btn2.onclick = function() {
    {
        keyword_reset(keyword1);
        keyword_reset(keyword2);
        keyword1_right = false;
        keyword2_right = false;
        guess_feedback.style.display = 'none';
        item_id = get_item(json_data);
        app_error.style.display = 'none';
        document.getElementById("newgame_btn2").style.display = 'none';
        document.getElementById("hint_btn").style.display = '';
        document.getElementById("guess_btn").style.display = '';
        render_items();
    }
};

clear_score_btn.onclick = function() {
    {
        score = 0;
        totalWinMashes = 0;
        console.log('Score wiped!')
        document.getElementById("table-score").innerHTML = score;
        document.getElementById("table-guesses").innerHTML = totalWinMashes;
        localStorage.removeItem('score');
        localStorage.removeItem('guesses');
        document.getElementById("delete_confirmed").style.display = 'inline';
        document.getElementById("clear-score").disabled = 'true';
        
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
    if (json_data.mashup[item_id].hint) {
    hint_btn.style.display = '';
    hint_btn.style.disabled = 'false';
    } else {
    hint_btn.style.display = 'none';
    hint_btn.style.disabled = 'true';}
}