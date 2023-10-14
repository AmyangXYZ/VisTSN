"""
Author: <Chuanyu> (skewcy@gmail.com)
app_oct13.py (c) 2023
Desc: description
Created:  2023-10-13T23:37:53.317Z
"""

## THIS SCRIPT IS ONLY DEMOSTRATION PURPOSE

## How to run: python3 app.py

import asyncio
import websockets
import os
import numpy as np
import pandas as pd
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

## Upper bound of the delay

PROC_DELAY = 1000
BE_SLOT = 4500 * 8
MAX_BE_DURATION = 500_000_000 ## Queue 0
MAX_BE_NUM = MAX_BE_DURATION // BE_SLOT
CTR_SLOT = 200 * 8
MAX_CTR_DURATION = 10_000_000 ## Queue 1
MAX_CTR_NUM = MAX_CTR_DURATION // CTR_SLOT
SYNC_ERROR = 50 * 10
SYNC_ERROR_RATE = 0.3
SYNC_ERROR_DRIFT = 0.2


def find_file(path, string):
    all_files = os.listdir(path)
    target_files = []
    for file in all_files:
        if string in file:
            target_files.append(file)
    if len(target_files) == 1:
        return target_files[0]
    else:
        print("found files more than one, please specify")


def rand_schedule(links, num_channels=6, interval_size=10000, makespan=100000):
    schedule = {}
    schedule["cycle"] = makespan
    for link in links:
        # Initialize random start times for each channel
        start_times = [
            random.randint(0, (makespan - interval_size) // 10000) * 10000
            for _ in range(num_channels)
        ]
        schedule[link] = [[i + 2, start_times[i], start_times[i] + interval_size]
                          for i in range(num_channels)]
    return schedule

def rand_bandwidth(links, min_bandwidth=0, max_bandwidth=65536):
    bandwidth_status = {}
    for link in links:
        bandwidth_status[link] = {
            "bandwidth": random.randint(min_bandwidth, max_bandwidth),
        }

    return bandwidth_status

def vibrate_bandwidth(bandwidth_status, min_bandwidth=0, max_bandwidth=65536):
    for link in bandwidth_status:
        new_bandwidth = bandwidth_status[link]["bandwidth"] * np.random.normal(1, 0.2)
        # Constrain the bandwidth within the specified limits
        new_bandwidth = max(min_bandwidth, min(new_bandwidth, max_bandwidth))
        bandwidth_status[link]["bandwidth"] = new_bandwidth
    return bandwidth_status

class Server:

    def __init__(self, config_path="./config/") -> None:
        self.delay = self.read_delay(config_path)  ## stream -> delay
        self.GCL = self.merge_schedule(self.read_GCL(config_path))

        self.route = self.read_route(
            config_path)  ## stream -> [link0, link1,...  ]
        self.bandwidth = self.init_bandwidth()  ## link -> {bandwidth: 0}
        self.prio_map = {}  ## link -> map
        self.sync = self.init_sync(
        )  ## node -> {"is_sync": True, "offset": 0, "type": "GM" or "BC" or "Slave"}
        self.cycle = None
    
    @staticmethod
    def trans_schedule(schedule):
        ## Change CTRL and BE allocation
        new_schedule = {}
        new_schedule["cycle"] = schedule["cycle"]
        for link in schedule:
            cycle = schedule["cycle"]
            if link == "cycle":
                continue
            ## Remove the previous schedule
            new_gcl = []
            for entry in schedule[link]:
                if entry[0] not in [0, 1]:
                    new_gcl.append(entry)
            ## Add the new schedule
            num_be = random.randint(0, MAX_BE_NUM)
            num_ctr = random.randint(0, MAX_CTR_NUM)
            for i in range(num_be):
                start_time = random.randint(0, cycle - BE_SLOT)
                new_gcl.append([0, start_time, start_time + BE_SLOT])
            for i in range(num_ctr):
                start_time = random.randint(0,  cycle - CTR_SLOT )
                new_gcl.append([1, start_time, start_time + CTR_SLOT])
            new_schedule[link] = new_gcl
        # print("trans", new_schedule.keys())
        return new_schedule
        
    @staticmethod
    def calculate_bandwidth(schedule):
        bandwidth = {}
        for link in schedule.keys():
            if link == "cycle":
                continue
            bandwidth.setdefault(link, {"bandwidth": 0})
            for entry in schedule[link]:
                bandwidth[link]["bandwidth"] += int(entry[2]) - int(entry[1])
        return bandwidth

    def init_bandwidth(self):
        return self.calculate_bandwidth(self.GCL)

    def init_sync(self):
        sync = {}
        for node in NODES:
            sync[node] = {
                "is_sync":
                True,
                "offset":
                0,
                "type":
                "GM" if node == "sw00" else ("BC" if "sw" in node else "Slave")
            }
        return sync
    
    @staticmethod
    def update_sync(sync):
        for node in sync:
            if sync[node]["type"] == "GM":
                continue
            if random.random() < SYNC_ERROR_RATE:
                sync[node]["is_sync"] = False
                sync[node]["offset"] *= np.random.normal(1, SYNC_ERROR_DRIFT)
            else:
                sync[node]["is_sync"] = True
                sync[node]["offset"] = random.randint(-SYNC_ERROR, SYNC_ERROR)
        return sync
            

    @staticmethod
    def merge_schedule(schedule, slot_s=10000):
        new_schedule = {}
        new_schedule["cycle"] = schedule["cycle"]
        for link in schedule:
            if link == "cycle":
                continue
            new_schedule.setdefault(link, [])
            _start_time_set = set()
            for entry in schedule[link]:
                entry[1] = entry[1] // slot_s * slot_s
                entry[2] = entry[2] // slot_s * slot_s
                if entry[1] == entry[2]:
                    entry[2] += slot_s
                if entry[1] not in _start_time_set:
                    _start_time_set.add(entry[1])
                    new_schedule[link].append(entry)
        # print("merge", new_schedule.keys())
        return new_schedule

    @staticmethod
    def remove_overlap(schedule):
        new_schedule = {}
        new_schedule["cycle"] = schedule["cycle"]
        for link in schedule:
            if link == "cycle":
                continue
            # Sort by row[0] in descending order and then by row[1] in ascending order
            gcl = sorted(schedule[link], key=lambda x: (-x[0], x[1]))
            new_gcl = []

            ## Detect overlap
            for i, row in enumerate(gcl[:-1]):
                if row[2] > gcl[i + 1][1]:
                    ## Overlap
                    continue
                else:
                    new_gcl.append(row)
            new_schedule[link] = new_gcl
        # print("remove", new_schedule.keys())
        return new_schedule
                
    @staticmethod
    def update_delay(delay):
        _delay = []
        for row in delay:
            _delay.append({
                "id": int(row["id"]),
                "delay": int(row["delay"] + random.randint(-PROC_DELAY, PROC_DELAY)),
                "jitter": 0,
            })
        return _delay
    
    @staticmethod
    def read_delay(path):
        ## id, ins_id, delay
        df = pd.read_csv(path + find_file(path, "DELAY"))
        delay = []
        for i, row in df.iterrows():
            delay.append({
                "id": int(row["id"]),
                "delay": int(row["delay"]),
                "jitter": 0,
            })
        return delay

    @staticmethod
    def read_GCL(path):
        ## link, queue, start, end, cycle
        df = pd.read_csv(path + find_file(path, "GCL"))
        GCL = {}
        for i, row in df.iterrows():
            GCL.setdefault(row["link"], [])
            GCL[row["link"]].append(
                [int(row["queue"]),
                 int(row["start"]),
                 int(row["end"])])
        GCL['cycle'] = int(row["cycle"])
        return GCL

    @staticmethod
    def read_route(path):
        df = pd.read_csv(path + find_file(path, "ROUTE"))
        route = {}
        for i, row in df.iterrows():
            route.setdefault(int(row["id"]), [])
            route[int(row["id"])].append(row["link"])
        return route

    @staticmethod
    def log(t, info):
        return f"Iteration {t} -[{info}] {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}"


async def dummy_model(websocket, path):
    count = 0
    status = Server()
    num_tt = 0
    num_be = 0
    num_ctr = 0

    
    schedule = status.merge_schedule(
            status.remove_overlap(status.trans_schedule(status.GCL))
            )
    delay_status = status.update_delay(status.delay)
    bandwidth_status = rand_bandwidth(LINKS)
    clock_status = status.update_sync(status.sync)
    
    
    while True:
        schedule = status.merge_schedule(
            status.remove_overlap(status.trans_schedule(schedule))
            )
        # print(schedule.keys())
        delay_status = status.update_delay(delay_status)
        bandwidth_status = vibrate_bandwidth(bandwidth_status)
        clock_status = status.update_sync(clock_status)
        
        num_tt += len(status.delay)
        num_be += np.random.randint(0, 100)
        num_ctr += len(status.GCL) + 1
        log_status = status.log(count, f"TT-{num_tt} BE-{num_be} CTR-{num_ctr}")

        # print(bandwidth_status)
        
        update = {
            "schedule": rand_schedule(LINKS),
            "delay": delay_status,
            "bandwidth": bandwidth_status,
            "clock": clock_status,
            "log": log_status
        }
        print(update["schedule"])
        
        await websocket.send(json.dumps(update))
        await asyncio.sleep(1)  # Delay for 1 second
        count += 1


if __name__ == "__main__":

    start_server = websockets.serve(dummy_model, "localhost", 4399)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

    ## Test server init
    # server = Server()
    # print(server.delay)
    # print(server.GCL)
    # print(server.route)
    # print(server.bandwidth)
    # print(server.sync)
