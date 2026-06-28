import { Difficulty, CodingTopic } from '@prisma/client';

export const codingProblems = [
  // 1. Arrays: Two Sum
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.ARRAYS,
    starterCodePy: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
    starterCodeJs: 'function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}',
    starterCodeJava: 'public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}',
    testCases: [
      { id: 'ts-1', input: '[[2,7,11,15],9]', expectedOutput: '[0,1]' },
      { id: 'ts-2', input: '[[3,2,4],6]', expectedOutput: '[1,2]' }
    ],
    hiddenTestCases: [
      { id: 'ts-h1', input: '[[3,3],6]', expectedOutput: '[0,1]' },
      { id: 'ts-h2', input: '[[1,5,9],14]', expectedOutput: '[1,2]' }
    ]
  },
  // 2. Arrays: Contains Duplicate
  {
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.ARRAYS,
    starterCodePy: 'def containsDuplicate(nums):\n    # Write your code here\n    pass',
    starterCodeJs: 'function containsDuplicate(nums) {\n    // Write your code here\n    return false;\n}',
    starterCodeJava: 'public class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}',
    testCases: [
      { id: 'cd-1', input: '[[1,2,3,1]]', expectedOutput: 'true' },
      { id: 'cd-2', input: '[[1,2,3,4]]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { id: 'cd-h1', input: '[[1,1,1,3,3,4,3,2,4,2]]', expectedOutput: 'true' },
      { id: 'cd-h2', input: '[[]]', expectedOutput: 'false' }
    ]
  },
  // 3. Arrays: Maximum Subarray
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.ARRAYS,
    starterCodePy: 'def maxSubArray(nums):\n    # Write your code here\n    pass',
    starterCodeJs: 'function maxSubArray(nums) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'ms-1', input: '[[-2,1,-3,4,-1,2,1,-5,4]]', expectedOutput: '6' },
      { id: 'ms-2', input: '[[1]]', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { id: 'ms-h1', input: '[[5,4,-1,7,8]]', expectedOutput: '23' },
      { id: 'ms-h2', input: '[[-1,-2,-3]]', expectedOutput: '-1' }
    ]
  },
  // 4. Strings: Valid Anagram
  {
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.STRINGS,
    starterCodePy: 'def isValidAnagram(s, t):\n    # Write your code here\n    pass',
    starterCodeJs: 'function isValidAnagram(s, t) {\n    // Write your code here\n    return false;\n}',
    starterCodeJava: 'public class Solution {\n    public boolean isValidAnagram(String s, String t) {\n        // Write your code here\n        return false;\n    }\n}',
    testCases: [
      { id: 'va-1', input: '["anagram","nagaram"]', expectedOutput: 'true' },
      { id: 'va-2', input: '["rat","car"]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { id: 'va-h1', input: '["a","ab"]', expectedOutput: 'false' },
      { id: 'va-h2', input: '["awesome","someawe"]', expectedOutput: 'true' }
    ]
  },
  // 5. Strings: Reverse String
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.STRINGS,
    starterCodePy: 'def reverseString(s):\n    # Write your code here\n    # In python, modify s in place and return s\n    s.reverse()\n    return s',
    starterCodeJs: 'function reverseString(s) {\n    // Write your code here and return reversed array\n    return s.reverse();\n}',
    starterCodeJava: 'public class Solution {\n    public char[] reverseString(char[] s) {\n        // Write your code here and return reversed array\n        int l = 0, r = s.length - 1;\n        while (l < r) {\n            char temp = s[l];\n            s[l] = s[r];\n            s[r] = temp;\n            l++; r--;\n        }\n        return s;\n    }\n}',
    testCases: [
      { id: 'rs-1', input: '[["h","e","l","l","o"]]', expectedOutput: '["o","l","l","e","h"]' },
      { id: 'rs-2', input: '[["H","a","n","n","a","h"]]', expectedOutput: '["h","a","n","n","a","H"]' }
    ],
    hiddenTestCases: [
      { id: 'rs-h1', input: '[["a"]]', expectedOutput: '["a"]' },
      { id: 'rs-h2', input: '[[]]', expectedOutput: '[]' }
    ]
  },
  // 6. Strings: Longest Substring Without Repeating Characters
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.STRINGS,
    starterCodePy: 'def longestSubstring(s):\n    # Write your code here\n    pass',
    starterCodeJs: 'function longestSubstring(s) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int longestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'ls-1', input: '["abcabcbb"]', expectedOutput: '3' },
      { id: 'ls-2', input: '["bbbbb"]', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { id: 'ls-h1', input: '["pwwkew"]', expectedOutput: '3' },
      { id: 'ls-h2', input: '[""]', expectedOutput: '0' }
    ]
  },
  // 7. Hashing: Group Anagrams
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.HASHING,
    starterCodePy: 'def groupAnagrams(strs):\n    # Write your code here\n    pass',
    starterCodeJs: 'function groupAnagrams(strs) {\n    // Write your code here\n    return [];\n}',
    starterCodeJava: 'public class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}',
    testCases: [
      { id: 'ga-1', input: '[["eat","tea","tan","ate","nat","bat"]]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
      { id: 'ga-2', input: '[[""]]', expectedOutput: '[[""]]' }
    ],
    hiddenTestCases: [
      { id: 'ga-h1', input: '[["a"]]', expectedOutput: '[["a"]]' },
      { id: 'ga-h2', input: '[["boo","oob"]]', expectedOutput: '[["boo","oob"]]' }
    ]
  },
  // 8. Hashing: Top K Frequent Elements
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.HASHING,
    starterCodePy: 'def topKFrequent(nums, k):\n    # Write your code here\n    pass',
    starterCodeJs: 'function topKFrequent(nums, k) {\n    // Write your code here\n    return [];\n}',
    starterCodeJava: 'public class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your code here\n        return new int[0];\n    }\n}',
    testCases: [
      { id: 'tk-1', input: '[[1,1,1,2,2,3],2]', expectedOutput: '[1,2]' },
      { id: 'tk-2', input: '[[1],1]', expectedOutput: '[1]' }
    ],
    hiddenTestCases: [
      { id: 'tk-h1', input: '[[4,4,4,6,6,8],2]', expectedOutput: '[4,6]' },
      { id: 'tk-h2', input: '[[1,2],2]', expectedOutput: '[1,2]' }
    ]
  },
  // 9. Linked Lists: Reverse Linked List
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.\n\nNote: For input and output representation, we use lists of numbers.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.LINKED_LISTS,
    starterCodePy: 'def reverseList(head):\n    # Write your code here (represented as list of integers)\n    # Input is Python list, e.g. [1,2,3,4,5]\n    return head[::-1]',
    starterCodeJs: 'function reverseList(head) {\n    // Input is JS Array, e.g. [1,2,3,4,5]\n    return head.reverse();\n}',
    starterCodeJava: 'public class Solution {\n    public int[] reverseList(int[] head) {\n        int[] res = new int[head.length];\n        for (int i = 0; i < head.length; i++) {\n            res[i] = head[head.length - 1 - i];\n        }\n        return res;\n    }\n}',
    testCases: [
      { id: 'rl-1', input: '[[1,2,3,4,5]]', expectedOutput: '[5,4,3,2,1]' },
      { id: 'rl-2', input: '[[1,2]]', expectedOutput: '[2,1]' }
    ],
    hiddenTestCases: [
      { id: 'rl-h1', input: '[[]]', expectedOutput: '[]' },
      { id: 'rl-h2', input: '[[9,9,9]]', expectedOutput: '[9,9,9]' }
    ]
  },
  // 10. Linked Lists: Merge Two Sorted Lists
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    description: 'You are given the heads of two sorted linked lists `list1` and `list2` represented as arrays. Merge the two lists into one sorted array and return it.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.LINKED_LISTS,
    starterCodePy: 'def mergeTwoLists(list1, list2):\n    # Write your code here\n    pass',
    starterCodeJs: 'function mergeTwoLists(list1, list2) {\n    // Write your code here\n    return [];\n}',
    starterCodeJava: 'public class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        // Write your code here\n        return new int[0];\n    }\n}',
    testCases: [
      { id: 'mt-1', input: '[[1,2,4],[1,3,4]]', expectedOutput: '[1,1,2,3,4,4]' },
      { id: 'mt-2', input: '[[],[]]', expectedOutput: '[]' }
    ],
    hiddenTestCases: [
      { id: 'mt-h1', input: '[[],[0]]', expectedOutput: '[0]' },
      { id: 'mt-h2', input: '[[2,5],[1,6]]', expectedOutput: '[1,2,5,6]' }
    ]
  },
  // 11. Linked Lists: Linked List Cycle
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    description: 'Given `head`, the head of a linked list represented as an array, and `pos`, the index of the node that the tail connects to, return `true` if there is a cycle, otherwise `false`.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.LINKED_LISTS,
    starterCodePy: 'def hasCycle(head, pos):\n    # Write your code here\n    return pos >= 0',
    starterCodeJs: 'function hasCycle(head, pos) {\n    // Write your code here\n    return pos >= 0;\n}',
    starterCodeJava: 'public class Solution {\n    public boolean hasCycle(int[] head, int pos) {\n        return pos >= 0;\n    }\n}',
    testCases: [
      { id: 'lc-1', input: '[[3,2,0,-4],1]', expectedOutput: 'true' },
      { id: 'lc-2', input: '[[1,2],-1]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { id: 'lc-h1', input: '[[1],-1]', expectedOutput: 'false' },
      { id: 'lc-h2', input: '[[1,1,1,1],0]', expectedOutput: 'true' }
    ]
  },
  // 12. Trees: Maximum Depth of Binary Tree
  {
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    description: 'Given the `root` of a binary tree represented as an array (level-order traversal), return its maximum depth.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.TREES,
    starterCodePy: 'def maxDepth(root):\n    # Write your code here\n    pass',
    starterCodeJs: 'function maxDepth(root) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int maxDepth(int[] root) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'md-1', input: '[[3,9,20,null,null,15,7]]', expectedOutput: '3' },
      { id: 'md-2', input: '[[1,null,2]]', expectedOutput: '2' }
    ],
    hiddenTestCases: [
      { id: 'md-h1', input: '[[]]', expectedOutput: '0' },
      { id: 'md-h2', input: '[[0]]', expectedOutput: '1' }
    ]
  },
  // 13. Trees: Invert Binary Tree
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    description: 'Given the `root` of a binary tree represented as an array, invert the tree, and return its level-order representation.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.TREES,
    starterCodePy: 'def invertTree(root):\n    # Write your code here\n    pass',
    starterCodeJs: 'function invertTree(root) {\n    // Write your code here\n    return [];\n}',
    starterCodeJava: 'public class Solution {\n    public int[] invertTree(int[] root) {\n        // Write your code here\n        return new int[0];\n    }\n}',
    testCases: [
      { id: 'it-1', input: '[[4,2,7,1,3,6,9]]', expectedOutput: '[4,7,2,9,6,3,1]' },
      { id: 'it-2', input: '[[2,1,3]]', expectedOutput: '[2,3,1]' }
    ],
    hiddenTestCases: [
      { id: 'it-h1', input: '[[]]', expectedOutput: '[]' },
      { id: 'it-h2', input: '[[1]]', expectedOutput: '[1]' }
    ]
  },
  // 14. Trees: Same Tree
  {
    title: 'Same Tree',
    slug: 'same-tree',
    description: 'Given the roots of two binary trees `p` and `q` represented as arrays, write a function to check if they are the same or not.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.TREES,
    starterCodePy: 'def isSameTree(p, q):\n    # Write your code here\n    pass',
    starterCodeJs: 'function isSameTree(p, q) {\n    // Write your code here\n    return false;\n}',
    starterCodeJava: 'public class Solution {\n    public boolean isSameTree(int[] p, int[] q) {\n        // Write your code here\n        return false;\n    }\n}',
    testCases: [
      { id: 'st-1', input: '[[1,2,3],[1,2,3]]', expectedOutput: 'true' },
      { id: 'st-2', input: '[[1,2],[1,null,2]]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { id: 'st-h1', input: '[[],[]]', expectedOutput: 'true' },
      { id: 'st-h2', input: '[[1,2,1],[1,1,2]]', expectedOutput: 'false' }
    ]
  },
  // 15. Graphs: Number of Islands
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `\'1\'`s (land) and `\'0\'`s (water), return the number of islands.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.GRAPHS,
    starterCodePy: 'def numIslands(grid):\n    # Write your code here\n    pass',
    starterCodeJs: 'function numIslands(grid) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'ni-1', input: '[[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]]', expectedOutput: '1' },
      { id: 'ni-2', input: '[[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]]', expectedOutput: '3' }
    ],
    hiddenTestCases: [
      { id: 'ni-h1', input: '[[[["0"]]]]', expectedOutput: '0' },
      { id: 'ni-h2', input: '[[[["1"]]]]', expectedOutput: '1' }
    ]
  },
  // 16. Graphs: Clone Graph
  {
    title: 'Clone Graph',
    slug: 'clone-graph',
    description: 'Given a reference of a node in a connected undirected graph represented as an adjacency list, return a deep copy (clone) of the graph.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.GRAPHS,
    starterCodePy: 'def cloneGraph(adjList):\n    # Input is list of lists, output is the same clone list\n    return adjList',
    starterCodeJs: 'function cloneGraph(adjList) {\n    return adjList;\n}',
    starterCodeJava: 'public class Solution {\n    public int[][] cloneGraph(int[][] adjList) {\n        return adjList;\n    }\n}',
    testCases: [
      { id: 'cg-1', input: '[[[2,4],[1,3],[2,4],[1,3]]]', expectedOutput: '[[2,4],[1,3],[2,4],[1,3]]' },
      { id: 'cg-2', input: '[[]]', expectedOutput: '[]' }
    ],
    hiddenTestCases: [
      { id: 'cg-h1', input: '[[[]]]', expectedOutput: '[[]]' },
      { id: 'cg-h2', input: '[[[2],[1]]]', expectedOutput: '[[2],[1]]' }
    ]
  },
  // 17. Dynamic Programming: Climbing Stairs
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.DYNAMIC_PROGRAMMING,
    starterCodePy: 'def climbingStairs(n):\n    # Write your code here\n    pass',
    starterCodeJs: 'function climbingStairs(n) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int climbingStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'cs-1', input: '[2]', expectedOutput: '2' },
      { id: 'cs-2', input: '[3]', expectedOutput: '3' }
    ],
    hiddenTestCases: [
      { id: 'cs-h1', input: '[4]', expectedOutput: '5' },
      { id: 'cs-h2', input: '[45]', expectedOutput: '1836311903' }
    ]
  },
  // 18. Dynamic Programming: House Robber
  {
    title: 'House Robber',
    slug: 'house-robber',
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Return the maximum amount of money you can rob tonight without alerting the police.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.DYNAMIC_PROGRAMMING,
    starterCodePy: 'def rob(nums):\n    # Write your code here\n    pass',
    starterCodeJs: 'function rob(nums) {\n    // Write your code here\n    return 0;\n}',
    starterCodeJava: 'public class Solution {\n    public int rob(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}',
    testCases: [
      { id: 'hr-1', input: '[[1,2,3,1]]', expectedOutput: '4' },
      { id: 'hr-2', input: '[[2,7,9,3,1]]', expectedOutput: '12' }
    ],
    hiddenTestCases: [
      { id: 'hr-h1', input: '[[]]', expectedOutput: '0' },
      { id: 'hr-h2', input: '[[100]]', expectedOutput: '100' }
    ]
  },
  // 19. Greedy: Jump Game
  {
    title: 'Jump Game',
    slug: 'jump-game',
    description: 'You are given an integer array `nums`. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position.\n\nReturn `true` if you can reach the last index, or `false` otherwise.',
    difficulty: Difficulty.MEDIUM,
    topic: CodingTopic.GREEDY,
    starterCodePy: 'def canJump(nums):\n    # Write your code here\n    pass',
    starterCodeJs: 'function canJump(nums) {\n    // Write your code here\n    return false;\n}',
    starterCodeJava: 'public class Solution {\n    public boolean canJump(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}',
    testCases: [
      { id: 'jg-1', input: '[[2,3,1,1,4]]', expectedOutput: 'true' },
      { id: 'jg-2', input: '[[3,2,1,0,4]]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { id: 'jg-h1', input: '[[0]]', expectedOutput: 'true' },
      { id: 'jg-h2', input: '[[2,0,0]]', expectedOutput: 'true' }
    ]
  },
  // 20. SQL: Select All Customers
  {
    title: 'Select All Customers',
    slug: 'select-all-customers',
    description: 'Write a SQL query to select all records from a table named `customers`.',
    difficulty: Difficulty.EASY,
    topic: CodingTopic.SQL,
    starterCodePy: 'def solve():\n    # Return the SQL query string\n    return "SELECT * FROM customers"',
    starterCodeJs: 'function solve() {\n    // Return the SQL query string\n    return "SELECT * FROM customers";\n}',
    starterCodeJava: 'public class Solution {\n    public String solve() {\n        // Return the SQL query string\n        return "SELECT * FROM customers";\n    }\n}',
    testCases: [
      { id: 'sq-1', input: '[]', expectedOutput: '"SELECT * FROM customers"' }
    ],
    hiddenTestCases: [
      { id: 'sq-h1', input: '[]', expectedOutput: '"SELECT * FROM customers"' }
    ]
  }
];
