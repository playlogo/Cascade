#!/bin/bash

# Kill the previous instance if it exists
pkill -f "deno task run"


# File to store the execution count
count_file="count.txt"

# Check if the count file exists, if not create it and initialize to 0
if [ ! -f "$count_file" ]; then
    echo 0 > "$count_file"
fi

# Read the current count, increment it, and save it back
count=$(<"$count_file")
count=$((count + 1))
echo "$count" > "$count_file"


# Run the new instance in the background
deno task run out/shapes2.txt &
