import * as z from 'zod/v4'

// Test string constraint structure in v4
const minString = z.string().min(5)
const maxString = z.string().max(10)

// Test helper functions
function getMinLength(checks) {
  if (!checks) return undefined
  const minCheck = checks.find(check => check._zod?.def?.check === 'min_length')
  return minCheck?._zod?.def?.minimum
}

function getMaxLength(checks) {
  if (!checks) return undefined
  const maxCheck = checks.find(check => check._zod?.def?.check === 'max_length')
  return maxCheck?._zod?.def?.maximum
}

console.log('Min from checks:', getMinLength(minString._zod.def.checks))
console.log('Max from checks:', getMaxLength(maxString._zod.def.checks))

// Test conflicting constraints
const conflictMin = z.string().min(10)
const conflictMax = z.string().max(5)

console.log('Conflict min from checks:', getMinLength(conflictMin._zod.def.checks))
console.log('Conflict max from checks:', getMaxLength(conflictMax._zod.def.checks))
