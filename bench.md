## Static file, no concurrency

```
Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /statics/test.html
Document Length:        1459 bytes

Concurrency Level:      5
Time taken for tests:   3.680 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      15810000 bytes
HTML transferred:       14590000 bytes
Requests per second:    2717.03 [#/sec] (mean)
Time per request:       1.840 [ms] (mean)
Time per request:       0.368 [ms] (mean, across all concurrent requests)
Transfer rate:          4194.94 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       2
Processing:     0    2   0.7      2      10
Waiting:        0    2   0.7      2      10
Total:          0    2   0.7      2      10

Percentage of the requests served within a certain time (ms)
  50%      2
  66%      2
  75%      2
  80%      2
  90%      3
  95%      3
  98%      3
  99%      4
 100%     10 (longest request)
```

## Typescript Webservice, no concurrency

```
Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /ha/lo/
Document Length:        10 bytes

Concurrency Level:      5
Time taken for tests:   1.908 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1050000 bytes
HTML transferred:       100000 bytes
Requests per second:    5241.70 [#/sec] (mean)
Time per request:       0.954 [ms] (mean)
Time per request:       0.191 [ms] (mean, across all concurrent requests)
Transfer rate:          537.48 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       2
Processing:     0    1   0.5      1       7
Waiting:        0    1   0.5      1       7
Total:          0    1   0.5      1       7

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      1
  75%      1
  80%      1
  90%      1
  95%      2
  98%      2
  99%      3
 100%      7 (longest request)
```

## JS webservice, no concurrency

```
Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /test/a/b/
Document Length:        62 bytes

Concurrency Level:      5
Time taken for tests:   1.988 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1570000 bytes
HTML transferred:       620000 bytes
Requests per second:    5029.07 [#/sec] (mean)
Time per request:       0.994 [ms] (mean)
Time per request:       0.199 [ms] (mean, across all concurrent requests)
Transfer rate:          771.06 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     0    1   0.5      1       9
Waiting:        0    1   0.5      1       9
Total:          0    1   0.5      1       9

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      1
  75%      1
  80%      1
  90%      1
  95%      2
  98%      2
  99%      2
 100%      9 (longest request)
```


## WebMethod, no concurrency
```
Server Software:
Server Hostname:        localhost
Server Port:            8080

Document Path:          /query
Document Length:        6 bytes

Concurrency Level:      5
Time taken for tests:   1.851 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1000000 bytes
HTML transferred:       60000 bytes
Requests per second:    5401.89 [#/sec] (mean)
Time per request:       0.926 [ms] (mean)
Time per request:       0.185 [ms] (mean, across all concurrent requests)
Transfer rate:          527.53 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     0    1   0.5      1       6
Waiting:        0    1   0.5      1       6
Total:          0    1   0.5      1       6

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      1
  75%      1
  80%      1
  90%      1
  95%      1
  98%      2
  99%      3
 100%      6 (longest request)
```