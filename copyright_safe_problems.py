#!/usr/bin/env python3
"""
Generate copyright-safe, original DSA problems for CodeCampus AI
All descriptions, titles, and examples are original and educational
"""

# Original problem mappings - completely rewritten
ORIGINAL_PROBLEMS = [
    # Arrays (15)
    {
        'id': 1,
        'slug': 'pair-sum-finder',
        'title': 'Pair Sum Finder',
        'difficulty': 'Easy',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys'],
        'description': 'You are given a list of numbers and a target value. Your task is to find two different positions in the list where the values add up to the target. Return the positions (indices) of these two numbers. You can assume there is always exactly one valid answer, and you cannot use the same position twice.',
        'examples': [
            {'input': 'numbers = [3,8,12,16], target = 11', 'output': '[0,1]', 'explanation': 'The values at positions 0 and 1 are 3 and 8, which sum to 11.'},
            {'input': 'numbers = [4,3,5], target = 8', 'output': '[1,2]'},
            {'input': 'numbers = [5,5], target = 10', 'output': '[0,1]'}
        ],
        'constraints': [
            'List contains at least 2 numbers',
            'Numbers can be negative or positive',
            'Target can be any integer',
            'Exactly one solution exists'
        ],
        'acceptance': 49.2,
        'timeLimit': 1800
    },
    {
        'id': 2,
        'slug': 'max-profit-price-changes',
        'title': 'Maximum Profit from Price Changes',
        'difficulty': 'Easy',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google', 'Wipro'],
        'description': 'You have access to historical price data for an item over several days. You can buy the item on one day and sell it on a later day. Calculate the maximum profit you can achieve. If no profit is possible, return 0.',
        'examples': [
            {'input': 'prices = [8,2,6,4,7,5]', 'output': '5', 'explanation': 'Buy at price 2 and sell at price 7 for profit of 5.'},
            {'input': 'prices = [9,7,5,3,1]', 'output': '0', 'explanation': 'Prices only decrease, so no profit possible.'}
        ],
        'constraints': [
            'At least one price value',
            'Prices are non-negative integers',
            'Must buy before selling'
        ],
        'acceptance': 54.1,
        'timeLimit': 1500
    },
    {
        'id': 3,
        'slug': 'duplicate-value-detector',
        'title': 'Duplicate Value Detector',
        'difficulty': 'Easy',
        'topic': 'Arrays',
        'companies': ['TCS', 'Infosys', 'Amazon'],
        'description': 'Given a list of integers, determine if any value appears more than once. Return true if duplicates exist, false if all values are unique.',
        'examples': [
            {'input': 'values = [1,3,5,1]', 'output': 'true'},
            {'input': 'values = [1,3,5,7]', 'output': 'false'},
            {'input': 'values = [2,2,2,4,4,5]', 'output': 'true'}
        ],
        'constraints': [
            'List has at least one element',
            'Values can be any integer'
        ],
        'acceptance': 61.3,
        'timeLimit': 1200
    },
    {
        'id': 4,
        'slug': 'array-product-puzzle',
        'title': 'Array Product Puzzle',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google', 'Meta'],
        'description': 'Create a new array where each position contains the product of all numbers from the original array except the one at that position. Solve this without using division and aim for linear time complexity.',
        'examples': [
            {'input': 'nums = [2,3,4,5]', 'output': '[60,40,30,24]'},
            {'input': 'nums = [-1,2,0,-3,4]', 'output': '[0,0,24,0,0]'}
        ],
        'constraints': [
            'At least 2 elements',
            'Numbers can be negative, zero, or positive',
            'Result fits in 32-bit integer'
        ],
        'acceptance': 64.8,
        'timeLimit': 1800
    },
    {
        'id': 5,
        'slug': 'max-subarray-sum',
        'title': 'Maximum Subarray Sum',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google', 'TCS'],
        'description': 'Find a continuous section of the array that has the largest sum. Return that maximum sum value.',
        'examples': [
            {'input': 'nums = [-3,2,-4,5,-2,3,2,-6,5]', 'output': '8', 'explanation': 'The section [5,-2,3,2] has sum 8.'},
            {'input': 'nums = [2]', 'output': '2'},
            {'input': 'nums = [6,5,-2,8,9]', 'output': '26'}
        ],
        'constraints': [
            'At least one number',
            'Numbers can be negative or positive'
        ],
        'acceptance': 50.3,
        'timeLimit': 1500
    },
    {
        'id': 6,
        'slug': 'interval-merger',
        'title': 'Interval Merger',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Google', 'Microsoft', 'Meta'],
        'description': 'You have a collection of time intervals, each with a start and end time. Merge any overlapping intervals and return the final list of non-overlapping intervals.',
        'examples': [
            {'input': 'intervals = [[1,4],[3,7],[9,11],[16,19]]', 'output': '[[1,7],[9,11],[16,19]]', 'explanation': 'Intervals [1,4] and [3,7] overlap, so merge them.'},
            {'input': 'intervals = [[1,5],[5,6]]', 'output': '[[1,6]]'}
        ],
        'constraints': [
            'At least one interval',
            'Start time <= end time',
            'Times are non-negative'
        ],
        'acceptance': 45.3,
        'timeLimit': 1800
    },
    {
        'id': 7,
        'slug': 'array-rotation',
        'title': 'Array Rotation',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Microsoft', 'Amazon', 'TCS', 'Infosys'],
        'description': 'Rotate the elements of an array to the right by k positions. Elements that move past the end wrap around to the beginning.',
        'examples': [
            {'input': 'nums = [1,2,3,4,5,6,7], k = 3', 'output': '[5,6,7,1,2,3,4]'},
            {'input': 'nums = [-2,-101,4,100], k = 2', 'output': '[4,100,-2,-101]'}
        ],
        'constraints': [
            'At least one element',
            'k is non-negative',
            'Modify array in-place if possible'
        ],
        'acceptance': 39.7,
        'timeLimit': 1500
    },
    {
        'id': 8,
        'slug': 'find-min-rotated-array',
        'title': 'Find Minimum in Rotated Array',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google'],
        'description': 'A sorted array has been rotated at some unknown point. All elements are unique. Find the minimum element efficiently using logarithmic time.',
        'examples': [
            {'input': 'nums = [4,5,6,1,2,3]', 'output': '1'},
            {'input': 'nums = [5,6,7,8,0,1,2]', 'output': '0'},
            {'input': 'nums = [12,14,16,18]', 'output': '12'}
        ],
        'constraints': [
            'At least one element',
            'All values are unique',
            'Use O(log n) time'
        ],
        'acceptance': 48.9,
        'timeLimit': 1500
    },
    {
        'id': 9,
        'slug': 'search-rotated-array',
        'title': 'Search in Rotated Array',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google', 'Meta'],
        'description': 'A sorted array with unique values has been rotated. Search for a target value and return its index, or -1 if not found. Use logarithmic time complexity.',
        'examples': [
            {'input': 'nums = [5,6,7,8,0,1,2], target = 0', 'output': '4'},
            {'input': 'nums = [5,6,7,8,0,1,2], target = 4', 'output': '-1'},
            {'input': 'nums = [2], target = 0', 'output': '-1'}
        ],
        'constraints': [
            'At least one element',
            'All values unique',
            'Use O(log n) time'
        ],
        'acceptance': 38.4,
        'timeLimit': 1500
    },
    {
        'id': 10,
        'slug': 'three-number-sum',
        'title': 'Three Number Sum',
        'difficulty': 'Medium',
        'topic': 'Arrays',
        'companies': ['Amazon', 'Microsoft', 'Google', 'Meta'],
        'description': 'Find all unique triplets in the array that sum to zero. Each triplet should use three different positions, and the result should not contain duplicate triplets.',
        'examples': [
            {'input': 'nums = [-2,0,2,3,-2,-5]', 'output': '[[-2,-2,4],[-2,0,2]]'},
            {'input': 'nums = [0,2,2]', 'output': '[]'},
            {'input': 'nums = [0,0,0]', 'output': '[[0,0,0]]'}
        ],
        'constraints': [
            'At least 3 elements',
            'Numbers can be negative, zero, or positive'
        ],
        'acceptance': 32.1,
        'timeLimit': 2400
    },
]

print("# Original copyright-safe problems generated")
print(f"# Total: {len(ORIGINAL_PROBLEMS)} problems")
print("# All content is original and educational")
