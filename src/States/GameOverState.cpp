//
// Created by Simon on 5/17/2020.
//

#include <log4cplus/loggingmacros.h>
#include "GameOverState.h"
#include "GameMenuState.h"

GameOverState::GameOverState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!gameOverMusic.openFromFile(TMAssets::gameOverMusicPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::gameOverMusicPath);
    }

    sf::Text gameOver;
    sf::Text returnToMenu;
    gameOver.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    gameOver.setString("GAME OVER");
    gameOver.setCharacterSize(TMConfig::gameOverMenuFontSize);
    gameOver.setFillColor(TMConfig::gameOverMenuColor);
    gameOver.setStyle(sf::Text::Bold);
    gameOver.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 200.0f, this->stateMachine->window.getSize().y * 0.5f - 50.0f));
    returnToMenu.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    returnToMenu.setString("Press Space to return");
    returnToMenu.setCharacterSize(TMConfig::gameOverMenuFontSize - 20);
    returnToMenu.setFillColor(TMConfig::gameOverMenuColor);
    returnToMenu.setStyle(sf::Text::Bold);
    returnToMenu.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 250.0f, this->stateMachine->window.getSize().y * 0.5f + 50.0f));

    gameOverMenuText.push_back(gameOver);
    gameOverMenuText.push_back(returnToMenu);

    gameOverMusic.setLoop(false);
    gameOverMusic.setVolume(this->stateMachine->configParser.getVolume());
    gameOverMusic.play();
}

void GameOverState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->window.draw(this->stateMachine->background);
    for (const auto& menuText: gameOverMenuText)
    {
        this->stateMachine->window.draw(menuText);
    }

}

void GameOverState::update(const float dt)
{
    if (!gameOverStarted)
    {
        gameOverStarted = true;
        clock.restart();
    }

    if (clock.getElapsedTime().asSeconds() > 0.2f)
    {
        clock.restart();
        gameOverColorIndex = (gameOverColorIndex + 1) % gameOverColorStates.size();
        gameOverMenuText[1].setFillColor(gameOverColorStates[gameOverColorIndex]);
    }
}

void GameOverState::handleInput()
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
                    sound.setVolume(this->stateMachine->configParser.getVolume());
                    sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::eMenuSelect]);
                    sound.play();
                    goBackToMainMenu();
                    break;
                }
            }
            default:
                break;
        }
    }
}

void GameOverState::goBackToMainMenu()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go back to main menu");
    gameOverMusic.stop();
    this->stateMachine->changeState(new GameMenuState(this->stateMachine));
}
