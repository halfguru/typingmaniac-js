//
// Created by Simon on 5/11/2020.
//

#ifndef TYPINGMANIAC_STATEMACHINE_H
#define TYPINGMANIAC_STATEMACHINE_H

#include <experimental/filesystem>
#include <log4cplus/logger.h>
#include <stack>
#include <SFML/Audio.hpp>
#include <SFML/Graphics.hpp>
#include "../GameConfig.h"
#include <Thor/Resources.hpp>

class State;

class StateMachine
{
public:
    StateMachine();
    ~StateMachine();

    void pushState(State* state);
    void popState();
    void changeState(State* state);
    State* peekState();
    void gameLoop();

    std::stack<State*> states;
    sf::RenderWindow window;
    sf::Sprite background;
    sf::Sprite volume;
    sf::Sprite muted;
    thor::ResourceHolder<sf::Font, TMAssets::FontType> fonts;
    thor::ResourceHolder<sf::Texture, TMAssets::TextureType> textures;
    thor::ResourceHolder<sf::SoundBuffer, TMAssets::SoundType> sounds;
    TMConfig::ConfigParser configParser;

private:
    void loadTextures();
    void loadSounds();
    void loadFonts();
};

#endif /* TYPINGMANIAC_STATEMACHINE_H */
