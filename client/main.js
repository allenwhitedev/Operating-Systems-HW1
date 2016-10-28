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
let readyQueue = []
let endTimes = []; let oldEndTimes = []

let calculate = function()
{
	let waitTimes = [ [],[] ]; let turnaroundTimes = []; let responseTimes = []
	let iterationTimes = []

	let currIOTime = 0; let currCPUTime = 0
	let cpuTime = 0; let totalTime = 0; let maxArrayWidth = 0

	// find max width of array
	for ( let y = 0; y < P.length; y++ )
		if ( maxArrayWidth < P[y].length )
			maxArrayWidth = P[y].length

	// traverse array by column top to bottom, starting with leftmost column
	
  // ----- first iteration used to find ready queue ---------
	for ( let x = 0; x < 1; x+=2 )
	{
		for ( let y = 0; y < P.length; y++ )
		{
			let entry = P[y][x]
			if ( entry != undefined ) // FCFS algorithm is applied here
			{		
	 			// find endtime for each cpu burst with its i/o 
				let iOBurst = P[y][x + 1]
				if ( iOBurst != undefined )
				{
					waitTimes[x].push(totalTime); responseTimes.push(totalTime) 
					oldEndTimes.push( entry + iOBurst + totalTime )
					totalTime += entry
				}
			}			
		}
			iterationTimes.push(totalTime)
		//y = 0 // reset y after a column is traversed

			// copy endTimes by value & sort
			let endTimesDescending = oldEndTimes.slice()
			endTimesDescending.sort( function(a, b){return a-b} ) 

			// load ready queue with programs in order to be executed
			for ( i in endTimesDescending )
				readyQueue.push( oldEndTimes.indexOf( endTimesDescending[i] ) )

			console.log("readyQueue", readyQueue)
			console.log("endTimes", oldEndTimes)
			console.log("totalTime", totalTime)
			console.log("waitTimes", waitTimes)
	}

	console.log("------------------------------\n")

	// ---- all iterations for scheduling besides first iteration ----
	for ( let x = 2; x < 4; x+=2 )
	{
		//endTimes = [] // reset endTimes before each iteration
		for ( let i = 0; i < readyQueue.length; i++ )
		{
			let entry = P[ readyQueue[i] ][x]
			if ( entry != undefined ) // FCFS algorithm is applied here
			{		
	 			// find endtime for each cpu burst with its i/o 
				let iOBurst = P[ readyQueue[i] ][x + 1]
				if ( iOBurst != undefined )
				{
					// update waitTimes here
					let waitingTime = totalTime - oldEndTimes[readyQueue.indexOf(i)]
					waitTimes[1][readyQueue.indexOf(i) ] = waitingTime 
					console.log("waitTimes update", waitTimes)
					console.log("waiting time for P" + readyQueue.indexOf(i) + " " + waitingTime )
					
					endTimes[i] = entry + iOBurst + totalTime
					totalTime += entry
				}
			}			
		}
		// --determine ready queue and waiting times after each iteration--

		iterationTimes.push( totalTime - iterationTimes[iterationTimes.length - 1] )

		// copy endTimes by value & sort
		let endTimesDescending = endTimes.slice()
		endTimesDescending.sort( function(a, b){return a-b} ) 

		// align endTimes with processes from ready queue

		let tempReadyQueue1 = []; let tempReadyQueue2 = []

		// load ready queue with programs in order to be executed
		for ( i in endTimesDescending )
			tempReadyQueue1.push( endTimes.indexOf( endTimesDescending[i] ) )

		// rearrange temp ready queue, accounting for previous ready queue order
		for ( let i = 0; i < tempReadyQueue1.length; i++)
			tempReadyQueue2.push( readyQueue.indexOf( tempReadyQueue1[i] ) )

		readyQueue = tempReadyQueue2.slice() // update ready queue

		// store last iteration's endtimes for next waiting time calculation 


		console.log("iterationTimes", iterationTimes)
		console.log("readyQueue", readyQueue)
		console.log("endTimes", endTimes)
		console.log("totalTime", totalTime)
		console.log("waitTimes", waitTimes)

		// y = 0 // reset y after a column is traversed
	}


}



Template.FCFS.helpers
({
	callCalculate()
	{
		calculate()
	}
})