# aiGuessr

![Javascript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![JSON](https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white) ![GithubPages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=GitHub%20Pages&logoColor=white)

An interactive javascript web application for guessing the mashup of two characters, generated externally.

[View on Github Pages](https://drraccoony.github.io/aiGuessr/)

## Running Application

This is a very light weight application and only requires a web browser with Javascript support. No external dependencies or databases needed. You can even view the current github build [here on Github Pages](https://drraccoony.github.io/aiGuessr/).

## Adding Items

New generations and images can be added by placing the image in the directory, and updating the json with the appropriate details.

1. Place your image within `/img` directory, with a somewhat descriptive filename.
2. Open `src/js/mashup.json` in your favorite text editor.
3. Following the object format, add a new json object, maintaining the existing keys.

    ```json
    "id": 0,
    "keyword1": "Mario",
    "keyword2": "Seinfeld",
    "image": "MarioAndSeinfeld.png"
    ```

## Issues

Feel free to submit issues and enhancement requests using the Github repo issue tracker.

## Contributions

In general, we follow the "fork-and-pull" Git workflow.

1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!