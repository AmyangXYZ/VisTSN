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
BE_SLOT = 10000
SYNC_ERROR = 50
SYNC_ERROR_RATE = 0.1
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
        self.log = []
        self.cycle = None

    def init_bandwidth(self):
        bandwidth = {}
        for link in self.GCL.keys():
            if link == "cycle":
                continue
            bandwidth.setdefault(link, {"bandwidth": 0})
            for entry in self.GCL[link]:

                bandwidth[link]["bandwidth"] += int(entry[2]) - int(entry[1])
        return bandwidth

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
    def merge_schedule(schedule, slot_s=10000):
        new_schedule = {}
        new_schedule["cycle"] = schedule["cycle"]
        for link in schedule:
            if link == "cycle":
                continue
            _start_time_set = set()
            for entry in schedule[link]:
                entry[1] = entry[1] // slot_s * slot_s
                entry[2] = entry[2] // slot_s * slot_s
                if entry[1] == entry[2]:
                    entry[2] += slot_s
                new_schedule.setdefault(link, [])
                if entry[1] not in _start_time_set:
                    _start_time_set.add(entry[1])
                    new_schedule[link].append(entry)
        return new_schedule

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
        return f"Iteration {t} - {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}-{info}"


async def dummy_model(websocket, path):
    count = 0
    status = Server()

    while True:
        schedule = status.GCL
        delay_status = status.delay
        bandwidth_status = status.bandwidth
        clock_status = status.sync
        log_status = status.log

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
