export const languages = ['C', 'C++', 'Java', 'JavaScript', 'Python']

export const codingProblems = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    acceptance: 52.4,
    submissions: 12480,
    solved: true,
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
    examples: [{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] equals 9.' }],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i], target ≤ 10⁹', 'Exactly one valid answer exists.'],
    starter: {
      C: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n}',
      'C++': 'vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}',
      Java: 'public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n}',
      JavaScript: 'function twoSum(nums, target) {\n  // Write your solution here\n}',
      Python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
    },
    testCases: [{ input: '[2, 7, 11, 15]\n9', expected: '[0, 1]' }, { input: '[3, 2, 4]\n6', expected: '[1, 2]' }],
  },
  {
    id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', tags: ['Linked List', 'Recursion'], acceptance: 74.1, submissions: 8640, solved: true,
    description: 'Given the head of a singly linked list, reverse the list and return the new head.',
    examples: [{ input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', explanation: 'Every next pointer is reversed.' }],
    constraints: ['The number of nodes is in the range [0, 5000].', '-5000 ≤ Node.val ≤ 5000'],
  },
  {
    id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['String', 'Stack'], acceptance: 40.8, submissions: 10210, solved: false,
    description: 'Given a string containing brackets, determine whether every opening bracket is closed by the same type in the correct order.',
    examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'Each opening bracket is closed in order.' }],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists only of parentheses, brackets, and braces.'],
  },
  {
    id: 'binary-tree-level-order', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', tags: ['Tree', 'BFS', 'Binary Tree'], acceptance: 63.2, submissions: 6790, solved: false,
    description: 'Given the root of a binary tree, return the level order traversal of its node values from left to right.',
    examples: [{ input: 'root = [3, 9, 20, null, null, 15, 7]', output: '[[3], [9, 20], [15, 7]]', explanation: 'Nodes are grouped by depth.' }],
    constraints: ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ Node.val ≤ 1000'],
  },
  {
    id: 'merge-sorted-arrays', title: 'Merge Two Sorted Arrays', difficulty: 'Easy', tags: ['Array', 'Two Pointers', 'Sorting'], acceptance: 50.7, submissions: 7350, solved: true,
    description: 'Merge two non-decreasing integer arrays into the first array, which has enough trailing space for all values.',
    examples: [{ input: 'nums1 = [1,2,3,0,0,0], m = 3\nnums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]', explanation: 'The values are merged in non-decreasing order.' }],
    constraints: ['nums1.length = m + n', '0 ≤ m, n ≤ 200', '-10⁹ ≤ nums1[i], nums2[j] ≤ 10⁹'],
  },
  {
    id: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium', tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'], acceptance: 49.6, submissions: 9180, solved: false,
    description: 'Find the contiguous subarray with the largest sum and return that sum.',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum.' }],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
  },
]

const genericStarter = {
  C: 'int solve(int* values, int size) {\n    // Write your solution here\n}',
  'C++': 'class Solution {\npublic:\n    auto solve(vector<int>& values) {\n        // Write your solution here\n    }\n};',
  Java: 'class Solution {\n    public Object solve(int[] values) {\n        // Write your solution here\n    }\n}',
  JavaScript: 'function solve(values) {\n  // Write your solution here\n}',
  Python: 'def solve(values):\n    # Write your solution here\n    pass',
}

export function getStarterCode(problem, language) {
  return problem?.starter?.[language] || genericStarter[language]
}

export function getTestCases(problem) {
  return problem?.testCases || [{ input: problem?.examples?.[0]?.input || '', expected: problem?.examples?.[0]?.output || '' }]
}

export const codingStats = { total: 128, easy: 72, medium: 44, hard: 12, streak: 9, favoriteLanguage: 'JavaScript' }

export const mockSubmissions = [
  { id: 'submission-1', problemId: 'two-sum', problem: 'Two Sum', status: 'Accepted', language: 'JavaScript', runtime: '54 ms', memory: '42.1 MB', submittedAt: '2026-09-25T08:42:00Z' },
  { id: 'submission-2', problemId: 'maximum-subarray', problem: 'Maximum Subarray', status: 'Wrong Answer', language: 'Python', runtime: '71 ms', memory: '18.7 MB', submittedAt: '2026-09-24T16:18:00Z' },
  { id: 'submission-3', problemId: 'valid-parentheses', problem: 'Valid Parentheses', status: 'Runtime Error', language: 'C++', runtime: 'N/A', memory: '7.8 MB', submittedAt: '2026-09-24T09:06:00Z' },
  { id: 'submission-4', problemId: 'reverse-linked-list', problem: 'Reverse Linked List', status: 'Accepted', language: 'Java', runtime: '2 ms', memory: '41.5 MB', submittedAt: '2026-09-23T14:31:00Z' },
  { id: 'submission-5', problemId: 'binary-tree-level-order', problem: 'Binary Tree Level Order Traversal', status: 'Time Limit Exceeded', language: 'Python', runtime: '> 2 s', memory: '20.3 MB', submittedAt: '2026-09-22T11:48:00Z' },
  { id: 'submission-6', problemId: 'merge-sorted-arrays', problem: 'Merge Two Sorted Arrays', status: 'Accepted', language: 'C', runtime: '4 ms', memory: '6.2 MB', submittedAt: '2026-09-21T07:15:00Z' },
]

export function formatSubmissionDate(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
