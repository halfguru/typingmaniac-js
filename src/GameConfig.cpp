//
// Created by Simon on 5/25/2020.
//

#include "GameConfig.h"

namespace TMConfig
{
    ConfigParser::ConfigParser(const std::string& configFilePath):
            configParser(configFilePath)
    {
        if (!std::experimental::filesystem::exists(configFilePath))
        {
            LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Config file doesn't exist!");
            initializeDefaultConfig();
        }

        if (!configParser.read(iniStruct))
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Failed to read config file " << configFilePath.c_str());
        }
    }

    void ConfigParser::initializeDefaultConfig()
    {
        iniStruct[sectionName][frameRatePropertyName] = FRAME_RATE;
        iniStruct[sectionName][screenWidthPropertyName] = SCREEN_WIDTH;
        iniStruct[sectionName][screenHeightPropertyName] = SCREEN_HEIGHT;
        iniStruct[sectionName][windowNamePropertyName] = WINDOW_NAME;
        iniStruct[sectionName][volumePropertyName] = defaultVolume;

        if (!configParser.generate(iniStruct, true))
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Failed to generate config file");
        }
    }

    std::string ConfigParser::read(const std::string& section, const std::string& property)
    {
        if (!iniStruct.has(section))
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Invalid config section: " << section.c_str());
        }
        return iniStruct[section][property];
    }

    int ConfigParser::readInt(const std::string& section, const std::string& property)
    {
        if (!iniStruct.has(section))
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Invalid config section: " << section.c_str());
        }
        return std::stoi(iniStruct[section][property]);
    }

    bool ConfigParser::writeInt(const std::string& section, const std::string& property, const unsigned int value)
    {
        if (!iniStruct.has(section))
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Invalid config section: " << section.c_str());
        }
        iniStruct[section][property] = std::to_string(value);
        return configParser.write(iniStruct);
    }

    int ConfigParser::getVolume()
    {
        return readInt(sectionName, volumePropertyName);
    }

    bool ConfigParser::setVolume(const unsigned int volume)
    {
        return writeInt(sectionName, volumePropertyName, volume);
    }
}
