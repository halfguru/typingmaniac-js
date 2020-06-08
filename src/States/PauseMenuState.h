//
// Created by Simon on 5/18/2020.
//

#ifndef TYPINGMANIAC_PAUSEMENUSTATE_H
#define TYPINGMANIAC_PAUSEMENUSTATE_H

#include "../GameConfig.h"
#include "../StateManager/State.h"
#include <Thor/Time.hpp>
#include <Thor/Shapes.hpp>

enum class PauseMenuChoices
{
    eVolume,
    eUnpause
};

class PauseMenuState: public State
{
public:
    explicit PauseMenuState(StateMachine* stateMachine);

    void draw(float dt) override;
    void update(float dt) override;
    void handleInput() override;

private:
    void goBackToInGame();

    sf::View menuView;
    sf::Sound sound;
    sf::Text pauseText;
    sf::Text returnToGameText;
    sf::Text volumeText;
    std::vector<sf::ConvexShape> volumeRects;
    unsigned int pauseMenuSelectionId = 1;
    unsigned int volumeRectIndex = 1;
};


#endif //TYPINGMANIAC_PAUSEMENUSTATE_H
