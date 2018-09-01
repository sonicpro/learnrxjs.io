import { from, interval, of, fromEvent } from "rxjs";
import { switchMap, mergeMap, tap, takeUntil, debounceTime } from "rxjs/operators";

const url = "https://baconipsum.com/api/?type=meat-and-filler";
const xhr = new XMLHttpRequest();

// "getBacon" Observable. You have to subscribe to it to execute the HTTP call.
const getBacon$ = from(new Promise<string>((resolve, reject) => {
        xhr.addEventListener("load", resolve.bind(null, xhr.response));
        xhr.open("GET", url);
        xhr.send();
    })).pipe(
        switchMap((_: string) => {
            const parsedData = JSON.parse(xhr.response);
            return of(parsedData);
        }));

// stopPolling Observable.
let stopPolling$ = fromEvent(document.getElementById("stop"), "click");

// startPolling Observable.
const startPolling$ = interval(5000).pipe(
    switchMap((_: number) => getBacon$),
    tap(parsedResponse => { document.getElementById("baconIpsum").innerHTML = parsedResponse[Math.floor(Math.random() * 5)]; }),
    takeUntil(stopPolling$)
);

// Subscribe to the dom event with the next() function that starts the polling.
fromEvent(document.getElementById("start"), "click").pipe(
    debounceTime(1000),
    mergeMap((_: any) => startPolling$)
).subscribe(); // Start the execution of the Observable, do not provide either next() or observer definition.
