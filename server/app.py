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

NODES = [
    "sw00", "sw01", "sw02", "sw03", "sw04", "sw05", "sw06", "sw07", "es08",
    "es09", "es10", "es11", "es12", "es13", "es14", "es15"
]


def init_schedule(links, num_channels=6, interval_size=10000, makespan=100000):
    schedule = {}
    schedule["cycle"] = makespan
    for link in links:
        # Initialize random start times for each channel
        start_times = [
            random.randint(0, (makespan - interval_size) // 10000) * 10000
            for _ in range(num_channels)
        ]
        schedule[link] = [[i, start_times[i], start_times[i] + interval_size]
                          for i in range(num_channels)]
    return schedule


def init_flow_status(flows, min_delay=0, max_delay=300000):
    delay_status = []
    for flow in flows:
        _temp = {}
        _temp['id'] = flow
        _temp['delay'] = random.randint(min_delay, max_delay)
        _temp['jitter'] = random.randint(0, _temp["delay"])
        delay_status.append(_temp)
    return delay_status


def init_link_status(links, min_bandwidth=0, max_bandwidth=65536):
    bandwidth_status = {}
    for link in links:
        bandwidth_status[link] = {
            "bandwidth": random.randint(min_bandwidth, max_bandwidth),
        }

    return bandwidth_status


def init_clock_status(nodes, min_offset=-1024, max_offset=1024):
    init_clock_status = {}
    for node in nodes:
        init_clock_status[node] = {
            "is_sync":
            True,
            "offset":
            random.randint(min_offset, max_offset) if node != "sw00" else 0,
            "type":
            "GM" if node == "sw00" else ("BC" if "sw" in node else "Slave")
        }
    return init_clock_status


def init_log_status(t):
    return f"Iteration {t} - {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}"


# def change_schedule(schedule,
#                     link,
#                     num_channels=6,
#                     interval_size=10000,
#                     delta=10000,
#                     makespan=100000):
#     # Check if link is in schedule
#     for i in range(num_channels):
#         schedule[link][i][1] = (schedule[link][i][1] + delta) % makespan
#         if schedule[link][i][1] + interval_size > makespan:
#             schedule[link][i][1] = makespan - interval_size
#         schedule[link][i][2] = schedule[link][i][1] + interval_size
#     return schedule


async def dummy_model(websocket, path):
    count = 0
    while True:
        schedule = init_schedule(LINKS)
        delay_status = init_flow_status(range(8))
        bandwidth_status = init_link_status(LINKS)
        clock_status = init_clock_status(NODES)
        log_status = init_log_status(count)

        update = {
            "schedule": schedule,
            "delay": delay_status,
            "bandwidth": bandwidth_status,
            "clock": clock_status,
            "log": log_status
        }
        await websocket.send(json.dumps(update))
        await asyncio.sleep(1)  # Delay for 1 second
        count += 1


start_server = websockets.serve(dummy_model, "localhost", 4399)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
