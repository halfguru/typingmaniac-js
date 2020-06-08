//
// Created by Simon on 5/20/2020.
//

#include <log4cplus/loggingmacros.h>
#include "CourseClearedState.h"

CourseClearedState::CourseClearedState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!courseClearedMusic.openFromFile(TMAssets::courseClearedMusicPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::courseClearedMusicPath);
    }

    courseClearedText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    courseClearedText.setCharacterSize(TMConfig::gameOverMenuFontSize);
    courseClearedText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 300.0f, this->stateMachine->window.getSize().y * 0.5f - 200.0f));

    courseClearedMusic.setLoop(false);
    courseClearedMusic.play();
}

void CourseClearedState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->window.draw(this->stateMachine->background);
    this->stateMachine->window.draw(courseClearedText);
}

void CourseClearedState::update(const float dt)
{
    if(clock.getElapsedTime().asSeconds() > 0.15f && courseClearedStringIndex < courseClearedString.size())
    {
        clock.restart();
        courseClearedText << sf::Color::Red << courseClearedString[courseClearedStringIndex++] << " ";
    }
}

void CourseClearedState::handleInput()
{
    sf::Event event;

    while(this->stateMachine->window.pollEvent(event))
    {
        switch(event.type)
        {
            /* Close the window */
            case sf::Event::Closed:
            {
                this->stateMachine->window.close();
                break;
            }
                /* Resize the window */
            case sf::Event::Resized:
            {
                menuView.setSize(event.size.width, event.size.height);
                this->stateMachine->background.setPosition(this->stateMachine->window.mapPixelToCoords(sf::Vector2i(0, 0)));
                this->stateMachine->background.setScale(
                        float(event.size.width) / float(this->stateMachine->background.getTexture()->getSize().x),
                        float(event.size.height) / float(this->stateMachine->background.getTexture()->getSize().y));
                break;
            }
            case sf::Event::KeyPressed:
            {
                if (event.key.code == sf::Keyboard::Space)
                {
                    goBacktoInGame();
                }
            }
            default:
                break;
        }
    }
}

void CourseClearedState::goBacktoInGame()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go back to ingame");
    courseClearedMusic.stop();
    this->stateMachine->popState();
}