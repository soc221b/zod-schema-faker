#!/usr/bin/env tsx

/**
 * Comprehensive Discovery Analysis Script
 *
 * This script runs a comprehensive analysis of intersection support gaps
 * by generating random Zod v4 built-in schemas with all their checks
 * and testing intersection combinations to identify unsupported cases.
 */

import { faker } from '@faker-js/faker'
import * as z from 'zod/v4'
import { setFaker } from '../src/v4'
import { detectGaps, runDiscoveryAnalysis, type GapAnalysisReport } from '../tests/v4/intersection-discovery.test'

// Set up faker
setFaker(faker)

async function main() {
  console.log('🔍 Starting Comprehensive Discovery Analysis for v4 Intersection Support')
  console.log('='.repeat(80))

  // Run comprehensive analysis with different test sizes
  const testSizes = [100, 500, 1000]
  const reports: GapAnalysisReport[] = []

  for (const testSize of testSizes) {
    console.log(`\n📊 Running analysis with ${testSize} test cases...`)

    const startTime = Date.now()
    const report = runDiscoveryAnalysis(testSize)
    const endTime = Date.now()

    reports.push(report)

    console.log(`✅ Completed in ${endTime - startTime}ms`)
    console.log(
      `   Found ${report.gapsFound} gaps out of ${report.totalTests} tests (${((report.gapsFound / report.totalTests) * 100).toFixed(1)}%)`,
    )
  }

  // Analyze the largest report in detail
  const largestReport = reports[reports.length - 1]

  console.log('\n📈 Detailed Analysis Results')
  console.log('='.repeat(50))

  console.log(`\nTotal Tests Run: ${largestReport.totalTests}`)
  console.log(`Total Gaps Found: ${largestReport.gapsFound}`)
  console.log(`Gap Rate: ${((largestReport.gapsFound / largestReport.totalTests) * 100).toFixed(1)}%`)

  console.log('\n📋 Gaps by Category:')
  for (const [category, gaps] of Object.entries(largestReport.gapsByCategory)) {
    console.log(`  ${category}: ${gaps.length} gaps`)

    if (gaps.length > 0) {
      // Show a few examples from each category
      const examples = gaps.slice(0, 3)
      for (const example of examples) {
        console.log(
          `    - ${example.leftSchema.type} & ${example.rightSchema.type}: ${example.errorMessage.substring(0, 60)}...`,
        )
      }
      if (gaps.length > 3) {
        console.log(`    ... and ${gaps.length - 3} more`)
      }
    }
  }

  console.log('\n🎯 Priority Gaps (Top 10):')
  for (let i = 0; i < Math.min(10, largestReport.priorityGaps.length); i++) {
    const gap = largestReport.priorityGaps[i]
    console.log(`  ${i + 1}. ${gap.leftSchema.type} & ${gap.rightSchema.type} (${gap.errorType})`)
    console.log(`     ${gap.errorMessage}`)
  }

  console.log('\n💡 Recommendations:')
  for (let i = 0; i < largestReport.recommendations.length; i++) {
    console.log(`  ${i + 1}. ${largestReport.recommendations[i]}`)
  }

  // Test specific known problematic combinations
  console.log('\n🧪 Testing Known Problematic Combinations')
  console.log('='.repeat(50))

  const knownProblematicCombinations = [
    [z.string(), z.number(), 'String & Number'],
    [z.boolean(), z.date(), 'Boolean & Date'],
    [z.literal('hello'), z.literal('world'), 'Conflicting Literals'],
    [z.string().min(10), z.string().max(5), 'Conflicting String Constraints'],
    [z.number().min(100), z.number().max(50), 'Conflicting Number Constraints'],
    [z.array(z.string()).min(5), z.array(z.string()).max(2), 'Conflicting Array Constraints'],
    [z.bigint().min(100n), z.bigint().max(50n), 'Conflicting BigInt Constraints'],
  ]

  for (const [left, right, description] of knownProblematicCombinations) {
    const gap = detectGaps(left as z.ZodType, right as z.ZodType)
    if (gap) {
      console.log(`❌ ${description}: ${gap.errorMessage}`)
    } else {
      console.log(`✅ ${description}: No gap detected (intersection works)`)
    }
  }

  // Test some combinations that should work
  console.log('\n✅ Testing Combinations That Should Work')
  console.log('='.repeat(50))

  const workingCombinations = [
    [z.string(), z.string(), 'String & String'],
    [z.string(), z.literal('hello'), 'String & Compatible Literal'],
    [z.number(), z.literal(42), 'Number & Compatible Literal'],
    [z.any(), z.string(), 'Any & String'],
    [z.unknown(), z.number(), 'Unknown & Number'],
    [z.object({ name: z.string() }), z.object({ age: z.number() }), 'Compatible Objects'],
    [z.array(z.string()), z.array(z.string()), 'Same Array Types'],
  ]

  for (const [left, right, description] of workingCombinations) {
    const gap = detectGaps(left as z.ZodType, right as z.ZodType)
    if (gap) {
      console.log(`❌ ${description}: Unexpected gap - ${gap.errorMessage}`)
    } else {
      console.log(`✅ ${description}: Works correctly`)
    }
  }

  // Generate summary statistics
  console.log('\n📊 Summary Statistics')
  console.log('='.repeat(50))

  const totalGapsAcrossAllRuns = reports.reduce((sum, report) => sum + report.gapsFound, 0)
  const totalTestsAcrossAllRuns = reports.reduce((sum, report) => sum + report.totalTests, 0)
  const averageGapRate = (totalGapsAcrossAllRuns / totalTestsAcrossAllRuns) * 100

  console.log(`Average Gap Rate Across All Runs: ${averageGapRate.toFixed(1)}%`)
  console.log(`Most Common Gap Type: ${getMostCommonGapType(largestReport)}`)
  console.log(`Implementation Coverage: ${(100 - averageGapRate).toFixed(1)}%`)

  // Provide actionable next steps
  console.log('\n🚀 Next Steps for Implementation')
  console.log('='.repeat(50))

  const nextSteps = generateNextSteps(largestReport)
  for (let i = 0; i < nextSteps.length; i++) {
    console.log(`${i + 1}. ${nextSteps[i]}`)
  }

  console.log('\n🎉 Discovery Analysis Complete!')
  console.log(`Generated comprehensive report covering ${totalTestsAcrossAllRuns} test cases`)
  console.log(`Identified ${totalGapsAcrossAllRuns} gaps for prioritized implementation`)
}

function getMostCommonGapType(report: GapAnalysisReport): string {
  let maxCount = 0
  let mostCommonType = 'none'

  for (const [type, gaps] of Object.entries(report.gapsByCategory)) {
    if (gaps.length > maxCount) {
      maxCount = gaps.length
      mostCommonType = type
    }
  }

  return `${mostCommonType} (${maxCount} gaps)`
}

function generateNextSteps(report: GapAnalysisReport): string[] {
  const steps: string[] = []

  // Prioritize based on gap categories
  if (report.gapsByCategory.unimplemented.length > 0) {
    steps.push(`Implement ${report.gapsByCategory.unimplemented.length} missing schema type combinations`)
  }

  if (report.gapsByCategory.constraint_conflict.length > 0) {
    steps.push(`Fix ${report.gapsByCategory.constraint_conflict.length} constraint merging issues`)
  }

  if (report.gapsByCategory.edge_case.length > 0) {
    steps.push(`Handle ${report.gapsByCategory.edge_case.length} edge case scenarios`)
  }

  if (report.gapsByCategory.performance.length > 0) {
    steps.push(`Optimize ${report.gapsByCategory.performance.length} performance bottlenecks`)
  }

  // Add general recommendations
  steps.push('Add more comprehensive property-based tests for discovered gap patterns')
  steps.push('Consider implementing a plugin system for custom intersection handlers')
  steps.push('Document known limitations and workarounds for impossible intersections')

  return steps
}

// Run the analysis
main().catch(console.error)
