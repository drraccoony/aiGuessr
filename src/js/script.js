// Set some application constants.
var APP_DEBUG = false                       // Enable more verbose logging to browser console.
const MAX_GUESSES = -1;                     // Define max number of guesses per round. -1 to disable
const APP_VERSION = '1.0.8';                // Application version
const SCORE_TRACKING = false;               // Should the application log and display scores
const SCORE_BASE = 500;                     // Score: Starting value for a guess.
const SCORE_DECAY = -75;                    // Amount to decay score on wrong guesses
const JSON_FILE = './src/js/test.json';   // Where does the JSON file live for items?

// End of user definable content.

// Fetch the json payload
const response = await fetch(JSON_FILE);
const json_data = await response.json();

// DOM Targets. Don't modify.
const html_image = document.getElementById("html_image");
const debug_div = document.getElementById("debug_div");
const debug_span = document.getElementById("debug_span");
const guess_btn = document.getElementById("guess_btn");
const hint_btn = document.getElementById("hint_btn");
const newgame_btn = document.getElementById("newgame_btn");
const giveup_btn = document.getElementById("giveup_btn");
const newgame_btn2 = document.getElementById("newgame_btn2");
const randomreveal_btn = document.getElementById("randomreveal_btn");
const clear_score_btn = document.getElementById("clear-score");
const keyword1 = document.getElementById("keyword1");
const keyword2 = document.getElementById("keyword2");
const guess_feedback = document.getElementById("guess_feedback");
const app_error = document.getElementById("app_error");
const help_modal = document.getElementById("help_modal");

// Functional Variables, Don't modify.
var guesses = 0;
if (localStorage.score) { debugThatShiz('Score loaded.'); var score = localStorage.getItem('score'); } else { score = 0 }
if (localStorage.guesses) { debugThatShiz('Guess History loaded.'); var totalWinMashes = localStorage.getItem('guesses'); } else { totalWinMashes = 0 }
var item_value = 0;
var gameover = false;
var keyword1_right = false;
var keyword2_right = false;

// Pick a random item from this json
var item_id = get_item(json_data);
render_items();
init();

// Define some custom commands in the JS Console.
Object.defineProperty(window, 'enableDebug', {
    get: function() {
      console.log("Enabling Debug!");
      APP_DEBUG = true;
    }
  });

Object.defineProperty(window, 'checkLinks', {
    get: function() {
        console.log('Checking Links...')
        console.log('If you see 404 errors, those are bad JSON references or the file is missing. This should only take a few seconds...')
        checkBadLinks(json_data);
    }
});

function init() {
    console.log('App v' + APP_VERSION + ' Initalized. Debugging ' + APP_DEBUG)
    document.getElementById("appVerSpan").innerHTML = APP_VERSION;
    document.getElementById("table-totalmashes").innerHTML = json_data.mashup.length;
    document.getElementById("table-guesses").innerHTML = totalWinMashes;
    document.getElementById("table-score").innerHTML = score;
    firstLoad();
}

function GetCookie(name) {
    var arg=name+"=";
    var alen=arg.length;
    var clen=document.cookie.length;
    var i=0;

    while (i<clen) {
        var j=i+alen;
            if (document.cookie.substring(i,j)==arg)
                return "here";
            i=document.cookie.indexOf(" ",i)+1;
            if (i==0) 
                break;
    }

    return null;
}

function firstLoad() {
    var visit=GetCookie("COOKIE1");
    if (visit==null){
        $('#helpModal').modal('toggle');
    }
    var expire=new Date();
    expire=new Date(expire.getTime()+7776000000);
    document.cookie="COOKIE1=here; expires="+expire;
}

function checkBadLinks(data) {
    debugThatShiz(data)
    var myStringArray = data.mashup;
    var arrayLength = myStringArray.length;
    for (var i = 0; i < arrayLength; i++) {
        // debugThatShiz(myStringArray[i]);
        let test = imageExists('img/' + myStringArray[i].image)
        function imageExists(image_url){
            var http = new XMLHttpRequest();
            http.open('HEAD', image_url, false);
            http.send();
            return http.status != 404;
        }
    }
}


html_image.addEventListener('error', function handleError() {
    const defaultImage =
        'https://minecraft-max.net/upload/resize_cache/iblock/a70/320_320_14a821bd1cef7808de0ee325b13280e30/a70cfdb1c91ed0c6117530332d071b87.png';

    html_image.src = defaultImage;
    html_image.alt = 'default';
    app_error.style.display = 'block';
    app_error.innerHTML = '<strong>404!!</strong> An image is missing. (' + json_data.mashup[item_id].image + ')<br><a href="#" id="newgame_btn">Generate new item</a>';

});

randomreveal_btn.onclick = function () {
    let x = (Math.floor(Math.random() * 2) == 0);
    if (x) {
        keyword1.style.backgroundColor = '#e6f5b0';
        keyword1.style.color = 'black';
        keyword1.value = json_data.mashup[item_id].keyword1;
        keyword1.disabled = true;
        keyword1_right = true;
        randomreveal_btn.disabled = true;
    } else {
        keyword2.style.backgroundColor = '#e6f5b0';
        keyword2.style.color = 'black';
        keyword2.value = json_data.mashup[item_id].keyword2;
        keyword2.disabled = true;
        keyword2_right = true;
        randomreveal_btn.disabled = true;
    }
}

giveup_btn.onclick = function () {
    keyword1.style.backgroundColor = '#f5b0c3';
    keyword1.style.color = 'black';
    keyword1.value = json_data.mashup[item_id].keyword1;
    keyword1.disabled = true;
    keyword2.style.backgroundColor = '#f5b0c3';
    keyword2.style.color = 'black';
    keyword2.value = json_data.mashup[item_id].keyword2;
    keyword2.disabled = true;
    randomreveal_btn.disabled = true;
    giveup_btn.disabled = true;
    document.getElementById("newgame_btn2").style.display = 'inline';
    document.getElementById("hint_btn").style.display = 'none';
    document.getElementById("guess_btn").style.display = 'none';
}

guess_btn.onclick = function () {
    //Make everything lower case so we don't have to deal with case
    let guess1 = keyword1.value.toLowerCase();
    let guess2 = keyword2.value.toLowerCase();
    let keyword1_json = json_data.mashup[item_id].keyword1;
    let keyword2_json = json_data.mashup[item_id].keyword2;

    // Build a list of all of the correct keywords, taking the array directly from JSON if it was stored as such, otherwise, assuming it was a single string
    let keywordlist1;
    let keywordlist2;

    if (Array.isArray(keyword1_json)) {
        keywordlist1 = keyword1_json.map(keyword => keyword.toLowerCase());
    } else {
        keywordlist1 = new Array(keyword1_json.toLowerCase());
    }

    if (Array.isArray(keyword2_json)) {
        keywordlist2 = keyword1_json.map(keyword => keyword.toLowerCase());
    } else {
        keywordlist2 = new Array(keyword2_json.toLowerCase());
    }

    if ((keyword1.value.length === 0 && keyword2.value.length === 0)) {
        debugThatShiz('⚠️ Empty guess.');
        show_message('Cant Guess Nothing!', 'You left one of your guesses blank. Try filling out both guesses.', 'alert-danger')
        return -1;
    }

    if ((guess1 == guess2) || (guess2 == guess1)) {
        debugThatShiz('⚠️ You cant guess the same thing twice!');
        show_message('Two of the same?', 'You guessed the same thing twice, guess something different.', 'alert-danger')
        return -1;
    }
    // Check if they got both right in one go
    if ((keywordlist1.includes(guess1)) && (keywordlist2.includes(guess2))) {
        debugThatShiz('✅ Correct guess! You got both words right!')
        if (SCORE_TRACKING == true)
            show_message('Great job!', 'You figured out the AI mashup! +' + item_value + ' points!', 'alert-success')
        else
            show_message('Great job!', 'You figured out the AI mashup!', 'alert-success')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        item_victory(item_value);
        keyword_success(keyword1);
        keyword_success(keyword2);
        keyword1_right = true;
        keyword2_right = true;
    } else if ((keywordlist1.includes(guess2)) && (keywordlist2.includes(guess1))) {
        // Does the guess match inverted?
        if (SCORE_TRACKING == true)
            show_message('Great job!', 'You figured out the AI mashup! +' + item_value + ' points!', 'alert-success')
        else
            show_message('Great job!', 'You figured out the AI mashup!', 'alert-success')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        item_victory(item_value);
        keyword_success(keyword1);
        keyword_success(keyword2);
        debugThatShiz('✅ Correct guess! You got both words right! (They were flipped)')
    }
    else if (((keywordlist1.includes(guess1)) || (keywordlist2.includes(guess1))) && keyword1_right == false) {
        // Does the word1 match either keyword? If so, mark it right.
        debugThatShiz('✅ You got word 1 right')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        show_message('Thats one...', 'You figured out one of the two mashup keywords.', 'alert-success')
        keyword_success(keyword1);
        randomreveal_btn.disabled = true;
        keyword1_right = true;
    }
    else if (((keywordlist1.includes(guess2)) || (keywordlist2.includes(guess2))) && keyword2_right == false) {
        // Does the word2 match either keyword? If so, mark it right.
        debugThatShiz('✅ You got word 2 right')
        document.getElementById("table-itemvalue").innerHTML = item_value;
        show_message('Thats one...', 'You figured out one of the two mashup keywords.', 'alert-success')
        keyword_success(keyword2);
        randomreveal_btn.disabled = true;
        keyword2_right = true;
    } else {
        // Nothing guessed correctly
        guesses++
        var remaining_gusses = MAX_GUESSES - guesses
        if (MAX_GUESSES == -1) {
            debugThatShiz('❌ Wrong guess, Try again!')
            item_value -= SCORE_DECAY;
            document.getElementById("table-itemvalue").innerHTML = item_value;
            show_message('Not Quite...', 'Give it another go.', 'alert-warning')
        }
        else {
            if (gameover) { debugThatShiz('❌ Wrong guess! Game Over!') }
            else { debugThatShiz('❌ Wrong guess! Guesses remaining: ' + remaining_gusses) }
        }
    }
};

function debugThatShiz(msg)
{
    if (APP_DEBUG == true)
    console.log(msg);
}

function show_message(header, msg, type) {
    guess_feedback.innerHTML = '<strong>' + header + '</strong> ' + msg;
    guess_feedback.className = '';
    guess_feedback.classList.add('alert');
    guess_feedback.classList.add(type);
    guess_feedback.style.display = 'block';
}

function keyword_success(id) {
    id.style.backgroundColor = 'green';
    id.style.color = 'white';
    id.disabled = true;
}

function item_victory(value) {
    if (SCORE_TRACKING)
    {
        score = localStorage.getItem('score');
        debugThatShiz('Value: ' + value)
        debugThatShiz('Score before value add: ' + score)
        score += value;
        debugThatShiz('Score before set: ' + score)
        totalWinMashes++;
        document.getElementById("table-score").innerHTML = score;
        document.getElementById("table-guesses").innerHTML = totalWinMashes;
        localStorage.removeItem('score');
        localStorage.setItem('score', score);
        localStorage.removeItem('guesses');
        localStorage.setItem('guesses', totalWinMashes);
    }
    document.getElementById("newgame_btn2").style.display = 'inline';
    document.getElementById("hint_btn").style.display = 'none';
    document.getElementById("guess_btn").style.display = 'none';
    randomreveal_btn.disabled = true;
}

function keyword_reset(id) {
    id.style.backgroundColor = '';
    id.style.color = '';
    id.disabled = false;
    id.value = '';
}

function get_item(json_data) {
    var guesses = 0;
    item_value = SCORE_BASE;
    document.getElementById("table-itemvalue").innerHTML = item_value;
    let item = Math.floor(Math.random() * json_data.mashup.length);
    debugThatShiz('🎲 [DEBUG IS ENABLED] Your mashup is: \x1B[93;4m' + json_data.mashup[item].keyword1 + '\x1B[m & \x1B[93;4m' + json_data.mashup[item].keyword2 + '\x1B[m. Complete object below.')
    debugThatShiz(json_data.mashup[item]);
    return item;
}

newgame_btn.onclick = function () {
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
        randomreveal_btn.disabled = false;
        giveup_btn.disabled = false;
        render_items();
    }
};

newgame_btn2.onclick = function () {
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
        randomreveal_btn.disabled = false;
        giveup_btn.disabled = false;
        render_items();
    }
};

clear_score_btn.onclick = function () {
    {
        score = 0;
        totalWinMashes = 0;
        debugThatShiz('Score wiped!')
        document.getElementById("table-score").innerHTML = score;
        document.getElementById("table-guesses").innerHTML = totalWinMashes;
        localStorage.removeItem('score');
        localStorage.removeItem('guesses');
        document.getElementById("delete_confirmed").style.display = 'inline';
        document.getElementById("clear-score").disabled = 'true';

    }
};

hint_btn.onclick = function () {
    {
        show_message('Hint: ', json_data.mashup[item_id].hint, 'alert-info')
    }
};

function render_items() {
    html_image.src = 'img/' + json_data.mashup[item_id].image
    debug_span.innerHTML = '<u>' + json_data.mashup[item_id].keyword1 + '</u> & <u>' + json_data.mashup[item_id].keyword2 + '</u>. Using image: <u>' + json_data.mashup[item_id].image + '</u>.'
    if (json_data.mashup[item_id].hint) {
        hint_btn.style.display = '';
        hint_btn.style.disabled = 'false';
    } else {
        hint_btn.style.display = 'none';
        hint_btn.style.disabled = 'true';
    }
}