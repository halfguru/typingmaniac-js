#include <log4cplus/initializer.h>
#include <log4cplus/configurator.h>
#include <iostream>
#include <memory>
#include "States/GameMenuState.h"

int main()
{
    srand(time(0));

    // Initialize logger
    log4cplus::Initializer initializer;
    log4cplus::BasicConfigurator config;
    config.configure();

    // Initialize state machine
    std::unique_ptr<StateMachine> stateMachine = std::make_unique<StateMachine>();
    stateMachine->pushState(new GameMenuState(stateMachine.get()));
    stateMachine->gameLoop();
    return 0;
}
