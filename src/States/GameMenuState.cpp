//
// Created by Simon on 5/11/2020.
//

#include <log4cplus/loggingmacros.h>
#include "../GameConfig.h"
#include "GameMenuState.h"
#include "GameState.h"

GameMenuState::GameMenuState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!gameMenuMusic.openFromFile(TMAssets::menuMusicPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::menuMusicPath);
    }

    startGameText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    startGameText.setString("Start Game");
    startGameText.setCharacterSize(TMConfig::menuFontSize);
    startGameText.setFillColor(TMConfig::gameMenuFontColor);
    startGameText.setStyle(sf::Text::Bold);
    startGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f, this->stateMachine->window.getSize().y * 0.5f));
    quitGameText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    quitGameText.setString("Quit");
    quitGameText.setCharacterSize(TMConfig::menuFontSize);
    quitGameText.setFillColor(TMConfig::gameMenuFontColor);
    quitGameText.setStyle(sf::Text::Bold);
    quitGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f, this->stateMachine->window.getSize().y * 0.56f));
    selectText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    selectText.setString(">");
    selectText.setCharacterSize(TMConfig::menuFontSize);
    selectText.setFillColor(TMConfig::gameMenuFontColor);
    selectText.setStyle(sf::Text::Bold);

    gameMenuMusic.setVolume(this->stateMachine->configParser.getVolume());
    gameMenuMusic.setLoop(true);
    gameMenuMusic.play();
}

void GameMenuState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->background.setColor(sf::Color(255, 255, 255, backgroundColorValue));
    this->stateMachine->window.draw(this->stateMachine->background);

    startGameText.setFillColor(TMConfig::gameMenuFontColor);
    quitGameText.setFillColor(TMConfig::gameMenuFontColor);
    selectText.setFillColor(sf::Color(255,  0, 0, colorValue));

    if (menuSelectionId == static_cast<int>(GameMenuChoice::ePlay))
    {
        selectText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.42f, this->stateMachine->window.getSize().y * 0.5f));
        startGameText.setFillColor(sf::Color(255,  0, 0, colorValue));
    }

    else if (menuSelectionId == static_cast<int>(GameMenuChoice::eQuit))
    {
        selectText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.42f, this->stateMachine->window.getSize().y * 0.56f));
        quitGameText.setFillColor(sf::Color(255,  0, 0, colorValue));
    }

    this->stateMachine->window.draw(startGameText);
    this->stateMachine->window.draw(quitGameText);
    this->stateMachine->window.draw(selectText);
}

void GameMenuState::update(const float dt)
{
    if(clock.getElapsedTime().asMilliseconds() > 50)
    {
        clock.restart();
        colorValue = (colorValue + 5) % (255) + 50;
        if (loadingGame)
        {
            if (gameMenuMusic.getVolume() > 1)
            {
                gameMenuMusic.setVolume(gameMenuMusic.getVolume() - 0.5f);
            }
            backgroundColorValue = backgroundColorValue - 10;
        }
    }

    if (backgroundColorValue < 10)
    {
        this->loadGame();
    }
}

void GameMenuState::handleInput()
{
    sf::Event event;

    while(this->stateMachine->window.pollEvent(event))
    {
        switch(event.type)
        {
            case sf::Event::Closed:
            {
                this->stateMachine->window.close();
                break;
            }
                /* Resize the window */
            case sf::Event::Resized:
            {
                sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
                menuView.setSize(pos);
                pos *= 0.5f;
                menuView.setCenter(pos);
                startGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f, this->stateMachine->window.getSize().y * 0.5f));
                quitGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f, this->stateMachine->window.getSize().y * 0.56f));
                break;
            }
            case sf::Event::KeyPressed:
            {
                if (event.key.code == sf::Keyboard::Down)
                {
                    menuSelectionId = (menuSelectionId + 1) % 2;
                }

                else if (event.key.code == sf::Keyboard::Up)
                {
                    menuSelectionId = (menuSelectionId - 1) % 2;
                }

                else if(event.key.code == sf::Keyboard::Enter)
                {
                    switch (menuSelectionId)
                    {
                        case static_cast<int>(GameMenuChoice::ePlay):
                        {
                            sound.setVolume(this->stateMachine->configParser.getVolume());
                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::eMenuSelect]);
                            sound.play();
                            loadingGame = true;
                            break;
                        }
                        case static_cast<int>(GameMenuChoice::eQuit):
                        {
                            LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Exiting game");
                            sound.setVolume(this->stateMachine->configParser.getVolume());
                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::eMenuSelect]);
                            sound.play();
                            this->stateMachine->window.close();
                            break;
                        }
                        default:
                            break;
                    }

                }
                break;
            }
            default:
                break;
        }
    }
}

void GameMenuState::loadGame()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Starting game");
    gameMenuMusic.stop();
    this->stateMachine->pushState(new GameState(this->stateMachine));
}