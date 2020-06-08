//
// Created by Simon on 5/12/2020.
//

#ifndef TYPINGMANIAC_GAMESTATE_H
#define TYPINGMANIAC_GAMESTATE_H

#include <SFML/Graphics.hpp>
#include <Thor/Time.hpp>
#include <Thor/Shapes.hpp>
#include "../StateManager/State.h"
#include "GameState.h"

static constexpr unsigned char BACKSPACE_KEY = 8;
static constexpr unsigned char SPACE_KEY = 32;
static constexpr unsigned char ESCAPE_KEY = 27;

struct WordState
{
    sfe::RichText word;
    std::string wordString = "";
    std::map<unsigned char, sf::Color> wordChars;
    unsigned short charIndex = 0;
    float wordXpos = 0.0f;
    float wordYPos = 0.0f;
    bool error = false;
};

struct GameStatistics
{
    const std::string scoreText = "Score: ";
    const std::string livesText = "Lives: ";
    const std::string wpmText = "WPM: ";
    const std::string percentageProgressionText = " %";
    int wpm = 0;
    float percentageProgression = 0.0f;
    int score = 0;
    char lives = 3;
    float allTypedChars = 0.0f;
    float wrongTypedChars = 0.0f;
};

struct GameConfig
{
    unsigned char wordTimeInterval = 1;
    float incrementSpeed = 1.0f;
    unsigned int wordLen = 10;
    std::string focusedWord = "";
};

class GameState: public State
{
public:
    explicit GameState(StateMachine* stateMachine);

    void draw(float dt) override;
    void update(float dt) override;
    void handleInput() override;

private:
    void loadDictionary();
    WordState spawnWord(const int16_t wordLen);
    void updateNextLevel();
    void goToGameOverMenu();
    void goToPauseMenu();
    void goToCourseCleared();
    void backspaceEventHandler();

    static constexpr int16_t WORDS_PER_LEVEL = 10;
    static constexpr unsigned char MAX_WORD_LENGTH = 20;
    std::map<unsigned char, std::vector<std::string>> dictionaryByLen;

    sf::Text gameText;
    sf::Text scoreText;
    sf::Text livesText;
    sf::Text wpmText;
    sf::Text progressionText;
    std::vector<WordState> drawnWords;
    sf::Sound sound;
    thor::StopWatch gameStopWatch;
    thor::StopWatch statsStopWatch;
    thor::StopWatch wpmStopWatch;
    unsigned int wpmRefreshCounter = 1;
    sf::View menuView;
    sf::Music inGameMusic;
    sf::RectangleShape limitRect;
    sf::ConvexShape staticProgressionRect;
    sf::ConvexShape progressionRect;
    sf::Vector2f oldProgressionRectSize;
    sf::Vector2f progressionRectSize;
    GameConfig gameConfig;
    GameStatistics gameStatistics;
    bool gameStarted = false;
    unsigned int statsColorValue = 150;
    bool increasingColorValue = false;
    bool gamePaused = false;
    bool wordCompleted = false;
};

#endif //TYPINGMANIAC_GAMESTATE_H
