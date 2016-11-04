import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

import './main.html'

// CPU burst, I/O time, CPU burst, I/O time, etc. & array is [y][x] format
let P = 
[
	[4,24,5,73,3,31,5,27,4,33,6,43,4,64,5,19,2],
	[18,31,19,35,11,42,18,43,19,47,18,43,17,51,19,32,10],
	[6,18,4,21,7,19,4,16,5,29,7,21,8,22,6,24,5],
	[17,42,19,55,20,54,17,52,15,67,12,72,15,66,14],
	[5,81,4,82,5,71,3,61,5,62,4,51,3,77,4,61,3,42,5],
	[10,35,12,41,14,33,11,32,15,41,13,29,11],
	[21,51,23,53,24,61,22,31,21,43,20],
	[11,52,14,42,15,31,17,21,16,43,12,31,13,32,15]
]
let readyQueue = [ [] ]
let endTimes = [ [] ] 
let waitTimes = [ [] ]

let iterationTimes = []

let cpuTime = 0

// find max width of array
let maxArrayWidth = 0
for ( let y = 0; y < P.length; y++ )
	if ( maxArrayWidth < P[y].length )
		maxArrayWidth = P[y].length

// find min width of array
let minArrayWidth = P[0].length
for ( let y = 0; y < P.length; y++ )
	if ( minArrayWidth > P[y].length )
	{
		minArrayWidth = P[y].length
		console.log("P" + y + " " + P[y].length)
	}


let calculateFCFS = function()
{
	let tmpReadyQueue = []
	let tmpEndTimes = []
	let tmpWaitTimes = []

	// fill first ready queue and end times array, from 0th iterations
	for (let i = 0; i < P.length; i++)
	{
		readyQueue[0].push(i)
		endTimes[0].push(0)
		waitTimes[0].push(0)
	}


	// compute iterations of shceduling program (FCFS)
	for (let x = 0; x < maxArrayWidth; x += 2) // cpu burst width
	{
		for (let y = 0; y < readyQueue[readyQueue.length - 1].length; y++) // height of programs
		{
			let nextProgram = readyQueue[readyQueue.length - 1][y]  
			let cpuBurst = P[nextProgram][x]
			let iOBurst = P[nextProgram][x + 1]

			// zero undefined entries to account for uneven program lengths 
			if (cpuBurst == undefined)
				break

				//cpuBurst = 0

			if (iOBurst == undefined) iOBurst = 0

			// store end time]
			tmpEndTimes[nextProgram] = cpuTime + cpuBurst + iOBurst 

			// store wait time in an array parallel to end times array
			let tmpWaitTime = cpuTime - endTimes[endTimes.length - 1][nextProgram]
			if (tmpWaitTime >= 0)
				tmpWaitTimes[nextProgram] = cpuTime - endTimes[endTimes.length - 1][nextProgram]
			
			cpuTime += cpuBurst // update cpu time

			// turnaround time for finished programs
			if (x >= P[nextProgram].length - 1)
			{
				//console.log("endTime", tmpEndTimes[nextProgram] )
				//console.log('cpuTime', cpuTime)
				let finishTime = cpuTime + iOBurst
				console.log("P" + nextProgram + " has finished with " + cpuBurst + " @ " + finishTime)
				break
			}
			//console.log(cpuBurst, iOBurst)
		}

		// update arrays after each iteration here
		
		// determine program order in upcoming ready queue
		let tmpEndTimesSorted = tmpEndTimes.slice().sort(function(a,b)
			{return a-b})

		// order & prepare ready queue
		for (let i = 0; i < tmpEndTimes.length; i++)
		{
			let nextReadyQueueProgram = tmpEndTimes.indexOf(tmpEndTimesSorted[i])
			
			// resolve end time ties
			if (tmpReadyQueue.indexOf(nextReadyQueueProgram) != -1)
			{
				console.log("tie!", tmpEndTimesSorted[i])
				
				let endTimeTie = tmpEndTimesSorted[i]
				
				// run through other end times and find next occurence of end time  
				// that is NOT in ready queue then setup to be added to ready queue
				for (let j = nextReadyQueueProgram + 1; j < tmpEndTimes.length; j++)
					if (tmpEndTimes[j] == endTimeTie && tmpReadyQueue.indexOf(j) == -1)
						nextReadyQueueProgram = j			
			}

			if (nextReadyQueueProgram != -1)
				tmpReadyQueue.push( nextReadyQueueProgram )			
		}
		console.log("tmpReadyQueue", tmpReadyQueue)
		// update multidimension arrays @ end of each iteration
		readyQueue[readyQueue.length] = tmpReadyQueue
		waitTimes[waitTimes.length] = tmpWaitTimes
		endTimes[endTimes.length] = tmpEndTimes

		//console.log("tmpWaitTimes", tmpWaitTimes)
		// reset temporary arrays after each iteration
		tmpReadyQueue = []; tmpEndTimes = []; tmpEndTimes = []; tmpWaitTimes = []

	}
		console.log("endTimes", endTimes)
		console.log("waitTimes", waitTimes)
		console.log("readyQueue", readyQueue)


		let p0WaitTime = 0
		for (let i = 0; i < waitTimes.length; i++)
			if (waitTimes[i][0] != undefined)
				p0WaitTime += waitTimes[i][0]
		//	console.log(waitTimes[i][0])
		//	p0WaitTime += waitTimes[i][0]

		console.log("p0WaitTime", p0WaitTime)
}



Template.FCFS.helpers
({
	callCalculate()
	{
		calculateFCFS()
	}
})