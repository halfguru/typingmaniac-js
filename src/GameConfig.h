//
// Created by Simon on 5/13/2020.
//

#ifndef TYPINGMANIAC_GAMECONFIG_H
#define TYPINGMANIAC_GAMECONFIG_H

#include <log4cplus/loggingmacros.h>
#include <SFML/Graphics/Color.hpp>
#include <experimental/filesystem>
#include <string>
#include "ini.h"

namespace TMConfig
{
    const std::string sectionName = "configuration";
    const std::string screenWidthPropertyName = "screen_width";
    const std::string screenHeightPropertyName = "screen_height";
    const std::string frameRatePropertyName = "frame_rate";
    const std::string windowNamePropertyName = "window_name";
    const std::string volumePropertyName = "volume";
    const std::string SCREEN_WIDTH = "1600";
    const std::string SCREEN_HEIGHT = "900";
    const std::string FRAME_RATE = "60";
    const std::string defaultVolume= "20";
    const std::string WINDOW_NAME = "Typing Maniac";

    class ConfigParser
    {
    public:
        ConfigParser(const std::string& configFilePath);

        mINI::INIFile configParser;

        void initializeDefaultConfig();
        std::string read(const std::string& section, const std::string& property);
        int readInt(const std::string& section, const std::string& property);
        bool writeInt(const std::string& section, const std::string& property, const unsigned int value);

        int getVolume();
        bool setVolume(const unsigned int volume);

    private:
        mINI::INIStructure iniStruct;

    };

    const std::experimental::filesystem::path configFilePath = "../config.ini";
    const std::experimental::filesystem::path dictionaryPath = "../dictionary.txt";
    static constexpr unsigned char pauseMenuFontSize = 90;
    static constexpr unsigned char gameOverMenuFontSize = 60;
    static constexpr unsigned char menuFontSize = 40;
    static constexpr unsigned char wordFontSize = 24;
    const sf::Color gameWordFontColor = sf::Color::White;
    const sf::Color gameWordHighlightColor = sf::Color::Yellow;
    const sf::Color gameWordErrorColor = sf::Color::Red;
    const sf::Color gameMenuFontColor = sf::Color::White;
    const sf::Color gameOverMenuColor = sf::Color::Red;
}

namespace TMAssets
{
    const std::experimental::filesystem::path fontsPath = "../assets/fonts/";
    const std::experimental::filesystem::path imagesPath = "../assets/images/";
    const std::experimental::filesystem::path soundsPath = "../assets/sounds/";
    const std::experimental::filesystem::path minecraftFontPath = fontsPath.string() + "minecraft.ttf";
    const std::experimental::filesystem::path backgroundImgPath = imagesPath.string() + "background.png";
    const std::experimental::filesystem::path blueBackgroundImgPath = imagesPath.string() + "blue-background.jpg";
    const std::experimental::filesystem::path volumeIconImgPath = imagesPath.string() + "volume-icon.png";
    const std::experimental::filesystem::path muteIconImgPath = imagesPath.string() + "mute-icon.png";
    const std::experimental::filesystem::path correctWordSoundPath = soundsPath.string() + "smw_coin.wav";
    const std::experimental::filesystem::path errorWordSoundPath = soundsPath.string() + "smw_lemmy_wendy_incorrect.wav";
    const std::experimental::filesystem::path menuSelectSoundPath = soundsPath.string() + "smb2_throw.wav";
    const std::experimental::filesystem::path menuPauseSoundPath = soundsPath.string() + "smw_pause.wav";
    const std::experimental::filesystem::path menuMusicPath = soundsPath.string() + "title_theme.wav";
    const std::experimental::filesystem::path inGameMusicPath = soundsPath.string() + "overworld_theme.wav";
    const std::experimental::filesystem::path gameOverMusicPath = soundsPath.string() + "smb_gameover.wav";
    const std::experimental::filesystem::path courseClearedMusicPath = soundsPath.string() + "smw_course_clear.wav";

    enum class TextureType
    {
        eBackground,
        eVolume,
        eMute
    };

    enum class SoundType
    {
        eCorrectWord,
        eErrorWord,
        eMenuSelect,
        eMenuPause
    };

    enum class FontType
    {
        eMinecraft
    };
}

#endif //TYPINGMANIAC_GAMECONFIG_H
