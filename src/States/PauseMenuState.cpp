//
// Created by Simon on 5/18/2020.
//

#include <log4cplus/loggingmacros.h>
#include "PauseMenuState.h"

PauseMenuState::PauseMenuState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    this->stateMachine->volume.setScale(this->stateMachine->window.getSize().x * 0.000019f, this->stateMachine->window.getSize().y * 0.000033f);
    this->stateMachine->volume.setPosition(this->stateMachine->window.getSize().x * 0.383f, this->stateMachine->window.getSize().y * 0.62f);
    this->stateMachine->muted.setScale(this->stateMachine->window.getSize().x * 0.000031f, this->stateMachine->window.getSize().y * 0.000055f);
    this->stateMachine->muted.setPosition(this->stateMachine->window.getSize().x * 0.383f, this->stateMachine->window.getSize().y * 0.62f);

    for (int i = 0; i < 5; ++i)
    {
        sf::ConvexShape volumeRect = thor::Shapes::roundedRect(sf::Vector2f(30.0f, 30.0f + 10.0f * i), 5.0f, sf::Color(sf::Color::Red));
        volumeRect.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f + this->stateMachine->window.getSize().x * 0.025f * i, this->stateMachine->window.getSize().y * 0.64f));
        volumeRect.rotate(180.0f);
        volumeRects.push_back(volumeRect);
    }

    volumeRectIndex = this->stateMachine->configParser.getVolume() / 20;
    for (int j = 0; j < volumeRectIndex; ++j) {
        volumeRects[j] = thor::Shapes::roundedRect(sf::Vector2f(30.0f, 30.0f + 10.0f * j), 5.0f, sf::Color(sf::Color::Green));
        volumeRects[j].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f + this->stateMachine->window.getSize().x * 0.025f * j, this->stateMachine->window.getSize().y * 0.64f));
        volumeRects[j].rotate(180.0f);
        this->stateMachine->window.draw(volumeRects[j]);
    }

    pauseText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    pauseText.setString("PAUSE");
    pauseText.setCharacterSize(TMConfig::pauseMenuFontSize);
    pauseText.setFillColor(TMConfig::gameOverMenuColor);
    pauseText.setStyle(sf::Text::Bold);
    pauseText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.28f));

    returnToGameText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    returnToGameText.setString("Return to game");
    returnToGameText.setCharacterSize(TMConfig::gameOverMenuFontSize - 20);
    returnToGameText.setFillColor(TMConfig::gameMenuFontColor);
    returnToGameText.setStyle(sf::Text::Bold);
    returnToGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.72f));

    volumeText.setFont(this->stateMachine->fonts[TMAssets::FontType::eMinecraft]);
    volumeText.setString("Master Volume");
    volumeText.setCharacterSize(TMConfig::gameOverMenuFontSize - 20);
    volumeText.setFillColor(TMConfig::gameMenuFontColor);
    volumeText.setStyle(sf::Text::Bold);
    volumeText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.5f));
}

void PauseMenuState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->window.draw(this->stateMachine->background);

    if (this->stateMachine->configParser.getVolume() == 0)
    {
        this->stateMachine->window.draw(this->stateMachine->muted);
    }
    else
    {
        this->stateMachine->window.draw(this->stateMachine->volume);
    }

    this->stateMachine->window.draw(volumeText);
    this->stateMachine->window.draw(pauseText);
    this->stateMachine->window.draw(returnToGameText);

    for (int i = 0; i < 5; ++i)
    {
        volumeRects[i] = thor::Shapes::roundedRect(sf::Vector2f(30.0f, 30.0f + 10.0f * i), 5.0f, sf::Color(sf::Color::Red));
        volumeRects[i].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f + this->stateMachine->window.getSize().x * 0.025f * i, this->stateMachine->window.getSize().y * 0.5f + 150.0f));
        volumeRects[i].rotate(180.0f);
        this->stateMachine->window.draw(volumeRects[i]);
    }

    for (int j = 0; j < volumeRectIndex; ++j) {
        volumeRects[j] = thor::Shapes::roundedRect(sf::Vector2f(30.0f, 30.0f + 10.0f * j), 5.0f, sf::Color(sf::Color::Green));
        volumeRects[j].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f + this->stateMachine->window.getSize().x * 0.025f * j, this->stateMachine->window.getSize().y * 0.5f + 150.0f));
        volumeRects[j].rotate(180.0f);
        this->stateMachine->window.draw(volumeRects[j]);
    }

}

void PauseMenuState::update(const float dt)
{
    volumeText.setFillColor(sf::Color::White);
    returnToGameText.setFillColor(sf::Color::White);


    if (pauseMenuSelectionId == static_cast<int>(PauseMenuChoices::eVolume))
        volumeText.setFillColor(sf::Color::Yellow);
    if (pauseMenuSelectionId == static_cast<int>(PauseMenuChoices::eUnpause))
        returnToGameText.setFillColor(sf::Color::Yellow);


}

void PauseMenuState::handleInput()
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
                sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
                menuView.setSize(pos);
                pos *= 0.5f;
                menuView.setCenter(pos);

                for (int i = 0; i < volumeRects.size(); ++i)
                {
                  volumeRects[i].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.45f + this->stateMachine->window.getSize().x * 0.025f * i, this->stateMachine->window.getSize().y * 0.64f));
                }
                this->stateMachine->volume.setScale(this->stateMachine->window.getSize().x * 0.000019f, this->stateMachine->window.getSize().y * 0.000033f);
                this->stateMachine->muted.setScale(this->stateMachine->window.getSize().x * 0.000031f, this->stateMachine->window.getSize().y * 0.000055f);
                this->stateMachine->volume.setPosition(this->stateMachine->window.getSize().x * 0.383f, this->stateMachine->window.getSize().y * 0.62f);
                this->stateMachine->muted.setPosition(this->stateMachine->window.getSize().x * 0.383f, this->stateMachine->window.getSize().y * 0.62f);
                pauseText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.28f));
                returnToGameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.72f));
                volumeText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.38f, this->stateMachine->window.getSize().y * 0.5f));
                break;
            }
            case sf::Event::KeyPressed:
            {
                if (event.key.code == sf::Keyboard::Down)
                {
                    pauseMenuSelectionId = (pauseMenuSelectionId + 1) % 2;
                }

                else if (event.key.code == sf::Keyboard::Up)
                {
                    pauseMenuSelectionId = (pauseMenuSelectionId - 1) % 2;
                }

                else if(event.key.code == sf::Keyboard::Enter)
                {
                    switch (pauseMenuSelectionId)
                    {
                        case static_cast<int>(PauseMenuChoices::eUnpause):
                        {
                            sound.setVolume(this->stateMachine->configParser.getVolume());
                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::eMenuSelect]);
                            sound.play();
                            goBackToInGame();
                            break;
                        }
                        default:
                            break;
                    }
                }

                else if(event.key.code == sf::Keyboard::Left && pauseMenuSelectionId == static_cast<int>(PauseMenuChoices::eVolume))
                {
                    if (this->stateMachine->configParser.getVolume() > 0)
                    {
                        volumeRectIndex--;
                        this->stateMachine->configParser.setVolume(this->stateMachine->configParser.getVolume() - 20);
                        LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Volume set at: " << this->stateMachine->configParser.readInt(TMConfig::sectionName, TMConfig::volumePropertyName));
                    }
                }

                else if(event.key.code == sf::Keyboard::Right && pauseMenuSelectionId == static_cast<int>(PauseMenuChoices::eVolume))
                {
                    if (this->stateMachine->configParser.getVolume() < 100)
                    {
                        volumeRectIndex++;
                        this->stateMachine->configParser.setVolume(this->stateMachine->configParser.getVolume() + 20);
                        LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Volume set at: " << this->stateMachine->configParser.readInt(TMConfig::sectionName, TMConfig::volumePropertyName));
                    }
                }
            }
            default:
                break;
        }
    }
}

void PauseMenuState::goBackToInGame()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go back to ingame");
    this->stateMachine->popState();
}