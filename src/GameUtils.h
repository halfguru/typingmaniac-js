//
// Created by Simon on 5/22/2020.
//

#ifndef TYPINGMANIAC_GAMEUTILS_H
#define TYPINGMANIAC_GAMEUTILS_H

namespace TMUtils
{

    float getGrossTypingSpeed(const float allTypedChars, const float minutesElapsed)
    {
        return allTypedChars / 5.0f / minutesElapsed;
    }

    float getNetTypingSpeed(const float allTypedChars, const float wrongTypedChars, const float minutesElapsed)
    {
        return ((allTypedChars / 5.0f) - wrongTypedChars) / minutesElapsed;
    }

    float getTypingAccuracy(const float correctTypedChars, const float allTypedChars)
    {
        return correctTypedChars / allTypedChars * 100.0f;
    }
}

#endif //TYPINGMANIAC_GAMEUTILS_H
