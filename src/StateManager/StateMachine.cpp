//
// Created by Simon on 5/11/2020.
//

#include <log4cplus/loggingmacros.h>
#include <SFML/Graphics.hpp>
#include "StateMachine.h"
#include "State.h"

StateMachine::StateMachine():
        configParser(TMConfig::configFilePath.string())
{
    this->window.create(sf::VideoMode(configParser.readInt(TMConfig::sectionName, TMConfig::screenWidthPropertyName),
                                            configParser.readInt(TMConfig::sectionName, TMConfig::screenHeightPropertyName)),
                                        configParser.read(TMConfig::sectionName, TMConfig::windowNamePropertyName));
    this->window.setFramerateLimit(configParser.readInt(TMConfig::sectionName, TMConfig::frameRatePropertyName));
    this->loadFonts();
    this->loadTextures();
    this->loadSounds();
    this->background.setTexture(textures[TMAssets::TextureType::eBackground]);
    this->volume.setTexture(textures[TMAssets::TextureType::eVolume]);
    this->muted.setTexture((textures[TMAssets::TextureType::eMute]));
}

StateMachine::~StateMachine()
{
    while(!this->states.empty())
    {
        popState();
    }
}

void StateMachine::pushState(State* state)
{
    this->states.push(state);
}

void StateMachine::popState()
{
    this->states.pop();
}

void StateMachine::changeState(State* state)
{
    if(!this->states.empty())
    {
        popState();
    }
    pushState(state);
}

State* StateMachine::peekState()
{
    if(this->states.empty())
    {
        return nullptr;
    }
    return this->states.top();
}

void StateMachine::gameLoop()
{
    sf::Clock clock;
    float dt;

    while(this->window.isOpen())
    {
        dt = clock.restart().asSeconds();

        if(peekState() == nullptr)
        {
            continue;
        }

        peekState()->handleInput();
        peekState()->update(dt);
        this->window.clear(sf::Color::Black);
        peekState()->draw(dt);
        this->window.display();
    }
}

void StateMachine::loadSounds()
{
    try
    {
        sounds.acquire(TMAssets::SoundType::eCorrectWord, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::correctWordSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::eErrorWord, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::errorWordSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::eMenuSelect, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::menuSelectSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::eMenuPause, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::menuPauseSoundPath.string()));
    }
    catch (thor::ResourceLoadingException& e)
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), e.what());
    }
}

void StateMachine::loadTextures()
{
    try
    {
        textures.acquire(TMAssets::TextureType::eBackground, thor::Resources::fromFile<sf::Texture>(TMAssets::blueBackgroundImgPath.string()));
        textures.acquire(TMAssets::TextureType::eVolume, thor::Resources::fromFile<sf::Texture>(TMAssets::volumeIconImgPath.string()));
        textures.acquire(TMAssets::TextureType::eMute, thor::Resources::fromFile<sf::Texture>(TMAssets::muteIconImgPath.string()));
    }
    catch (thor::ResourceLoadingException& e)
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), e.what());
    }
}

void StateMachine::loadFonts()
{
    try
    {
        fonts.acquire(TMAssets::FontType::eMinecraft, thor::Resources::fromFile<sf::Font>(TMAssets::minecraftFontPath.string()));
    }
    catch (thor::ResourceLoadingException& e)
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), e.what());
    }
}

