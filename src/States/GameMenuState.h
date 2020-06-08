//
// Created by Simon on 5/11/2020.
//

#ifndef TYPINGMANIAC_GAMEMENUSTATE_H
#define TYPINGMANIAC_GAMEMENUSTATE_H

#include "../StateManager/State.h"

enum class GameMenuChoice
{
    ePlay,
    eQuit
};


class GameMenuState: public State
{
public:
    explicit GameMenuState(StateMachine* stateMachine);

    void draw(float dt) override;
    void update(float dt) override;
    void handleInput() override;

private:
    void loadGame();

    sf::Text startGameText;
    sf::Text quitGameText;
    sf::Text selectText;
    sf::View menuView;
    sf::Clock clock;
    sf::Sound sound;
    sf::Music gameMenuMusic;
    bool loadingGame = false;
    unsigned int colorValue = 0;
    unsigned int menuSelectionId = 0;
    unsigned int backgroundColorValue = 255;
};

#endif //TYPINGMANIAC_GAMEMENUSTATE_H
