## How to run: python3 app.py

import asyncio
import websockets
import json
import time

import random

LINKS = [
    "(0, 8)", "(0, 1)", "(0, 7)", "(1, 9)", "(1, 2)", "(1, 0)", "(2, 10)",
    "(2, 3)", "(2, 1)", "(3, 11)", "(3, 4)", "(3, 2)", "(4, 12)", "(4, 5)",
    "(4, 3)", "(5, 13)", "(5, 6)", "(5, 4)", "(6, 14)", "(6, 7)", "(6, 5)",
    "(7, 15)", "(7, 0)", "(7, 6)", "(8, 0)", "(9, 1)", "(10, 2)", "(11, 3)",
    "(12, 4)", "(13, 5)", "(14, 6)", "(15, 7)"
]


def init_schedule(links, num_channels=6, interval_size=10000, makespan=100000):
    schedule = {}
    schedule["cycle"] = makespan
    for link in links:
        # Initialize random start times for each channel
        start_times = [
            random.randint(0, makespan - interval_size)
            for _ in range(num_channels)
        ]
        schedule[link] = [[i, start_times[i], start_times[i] + interval_size]
                          for i in range(num_channels)]
    return schedule


def change_schedule(schedule,
                    link,
                    num_channels=6,
                    interval_size=10000,
                    delta=10000,
                    makespan=100000):
    # Check if link is in schedule
    for i in range(num_channels):
        schedule[link][i][1] = (schedule[link][i][1] + delta) % makespan
        if schedule[link][i][1] + interval_size > makespan:
            schedule[link][i][1] = makespan - interval_size
        schedule[link][i][2] = schedule[link][i][1] + interval_size
    return schedule


async def dummy_model(websocket, path):
    schedule = init_schedule(LINKS)
    while True:
        await websocket.send(json.dumps(schedule))
        await asyncio.sleep(1)  # Delay for 1 second
        schedule = change_schedule(schedule, LINKS[0])


start_server = websockets.serve(dummy_model, "localhost", 4399)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
