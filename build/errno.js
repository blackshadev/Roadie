"use strict";
exports.all = [
    {
        "errno": -1,
        "code": "UNKNOWN",
        "description": "unknown error"
    },
    {
        "errno": 0,
        "code": "OK",
        "description": "success"
    },
    {
        "errno": 1,
        "code": "EOF",
        "description": "end of file"
    },
    {
        "errno": 2,
        "code": "EADDRINFO",
        "description": "getaddrinfo error"
    },
    {
        "errno": 3,
        "code": "EACCES",
        "description": "permission denied",
        "http": 403,
    },
    {
        "errno": 4,
        "code": "EAGAIN",
        "description": "resource temporarily unavailable"
    },
    {
        "errno": 5,
        "code": "EADDRINUSE",
        "description": "address already in use"
    },
    {
        "errno": 6,
        "code": "EADDRNOTAVAIL",
        "description": "address not available"
    },
    {
        "errno": 7,
        "code": "EAFNOSUPPORT",
        "description": "address family not supported"
    },
    {
        "errno": 8,
        "code": "EALREADY",
        "description": "connection already in progress"
    },
    {
        "errno": 9,
        "code": "EBADF",
        "description": "bad file descriptor"
    },
    {
        "errno": 10,
        "code": "EBUSY",
        "description": "resource busy or locked"
    },
    {
        "errno": 11,
        "code": "ECONNABORTED",
        "description": "software caused connection abort"
    },
    {
        "errno": 12,
        "code": "ECONNREFUSED",
        "description": "connection refused"
    },
    {
        "errno": 13,
        "code": "ECONNRESET",
        "description": "connection reset by peer"
    },
    {
        "errno": 14,
        "code": "EDESTADDRREQ",
        "description": "destination address required"
    },
    {
        "errno": 15,
        "code": "EFAULT",
        "description": "bad address in system call argument"
    },
    {
        "errno": 16,
        "code": "EHOSTUNREACH",
        "description": "host is unreachable"
    },
    {
        "errno": 17,
        "code": "EINTR",
        "description": "interrupted system call"
    },
    {
        "errno": 18,
        "code": "EINVAL",
        "description": "invalid argument"
    },
    {
        "errno": 19,
        "code": "EISCONN",
        "description": "socket is already connected"
    },
    {
        "errno": 20,
        "code": "EMFILE",
        "description": "too many open files"
    },
    {
        "errno": 21,
        "code": "EMSGSIZE",
        "description": "message too long"
    },
    {
        "errno": 22,
        "code": "ENETDOWN",
        "description": "network is down"
    },
    {
        "errno": 23,
        "code": "ENETUNREACH",
        "description": "network is unreachable"
    },
    {
        "errno": 24,
        "code": "ENFILE",
        "description": "file table overflow"
    },
    {
        "errno": 25,
        "code": "ENOBUFS",
        "description": "no buffer space available"
    },
    {
        "errno": 26,
        "code": "ENOMEM",
        "description": "not enough memory"
    },
    {
        "errno": 27,
        "code": "ENOTDIR",
        "description": "not a directory"
    },
    {
        "errno": 28,
        "code": "EISDIR",
        "description": "illegal operation on a directory"
    },
    {
        "errno": 29,
        "code": "ENONET",
        "description": "machine is not on the network"
    },
    {
        "errno": 31,
        "code": "ENOTCONN",
        "description": "socket is not connected"
    },
    {
        "errno": 32,
        "code": "ENOTSOCK",
        "description": "socket operation on non-socket"
    },
    {
        "errno": 33,
        "code": "ENOTSUP",
        "description": "operation not supported on socket"
    },
    {
        "errno": 34,
        "code": "ENOENT",
        "description": "no such file or directory",
        "http": 404
    },
    {
        "errno": 35,
        "code": "ENOSYS",
        "description": "function not implemented"
    },
    {
        "errno": 36,
        "code": "EPIPE",
        "description": "broken pipe"
    },
    {
        "errno": 37,
        "code": "EPROTO",
        "description": "protocol error"
    },
    {
        "errno": 38,
        "code": "EPROTONOSUPPORT",
        "description": "protocol not supported"
    },
    {
        "errno": 39,
        "code": "EPROTOTYPE",
        "description": "protocol wrong type for socket"
    },
    {
        "errno": 40,
        "code": "ETIMEDOUT",
        "description": "connection timed out"
    },
    {
        "errno": 41,
        "code": "ECHARSET",
        "description": "invalid Unicode character"
    },
    {
        "errno": 42,
        "code": "EAIFAMNOSUPPORT",
        "description": "address family for hostname not supported"
    },
    {
        "errno": 44,
        "code": "EAISERVICE",
        "description": "servname not supported for ai_socktype"
    },
    {
        "errno": 45,
        "code": "EAISOCKTYPE",
        "description": "ai_socktype not supported"
    },
    {
        "errno": 46,
        "code": "ESHUTDOWN",
        "description": "cannot send after transport endpoint shutdown"
    },
    {
        "errno": 47,
        "code": "EEXIST",
        "description": "file already exists"
    },
    {
        "errno": 48,
        "code": "ESRCH",
        "description": "no such process"
    },
    {
        "errno": 49,
        "code": "ENAMETOOLONG",
        "description": "name too long"
    },
    {
        "errno": 50,
        "code": "EPERM",
        "description": "operation not permitted"
    },
    {
        "errno": 51,
        "code": "ELOOP",
        "description": "too many symbolic links encountered"
    },
    {
        "errno": 52,
        "code": "EXDEV",
        "description": "cross-device link not permitted"
    },
    {
        "errno": 53,
        "code": "ENOTEMPTY",
        "description": "directory not empty"
    },
    {
        "errno": 54,
        "code": "ENOSPC",
        "description": "no space left on device"
    },
    {
        "errno": 55,
        "code": "EIO",
        "description": "i/o error"
    },
    {
        "errno": 56,
        "code": "EROFS",
        "description": "read-only file system"
    },
    {
        "errno": 57,
        "code": "ENODEV",
        "description": "no such device"
    },
    {
        "errno": 58,
        "code": "ESPIPE",
        "description": "invalid seek"
    },
    {
        "errno": 59,
        "code": "ECANCELED",
        "description": "operation canceled"
    }
];
exports.errno = {
    '-1': exports.all[0],
    '0': exports.all[1],
    '1': exports.all[2],
    '2': exports.all[3],
    '3': exports.all[4],
    '4': exports.all[5],
    '5': exports.all[6],
    '6': exports.all[7],
    '7': exports.all[8],
    '8': exports.all[9],
    '9': exports.all[10],
    '10': exports.all[11],
    '11': exports.all[12],
    '12': exports.all[13],
    '13': exports.all[14],
    '14': exports.all[15],
    '15': exports.all[16],
    '16': exports.all[17],
    '17': exports.all[18],
    '18': exports.all[19],
    '19': exports.all[20],
    '20': exports.all[21],
    '21': exports.all[22],
    '22': exports.all[23],
    '23': exports.all[24],
    '24': exports.all[25],
    '25': exports.all[26],
    '26': exports.all[27],
    '27': exports.all[28],
    '28': exports.all[29],
    '29': exports.all[30],
    '31': exports.all[31],
    '32': exports.all[32],
    '33': exports.all[33],
    '34': exports.all[34],
    '35': exports.all[35],
    '36': exports.all[36],
    '37': exports.all[37],
    '38': exports.all[38],
    '39': exports.all[39],
    '40': exports.all[40],
    '41': exports.all[41],
    '42': exports.all[42],
    '44': exports.all[43],
    '45': exports.all[44],
    '46': exports.all[45],
    '47': exports.all[46],
    '48': exports.all[47],
    '49': exports.all[48],
    '50': exports.all[49],
    '51': exports.all[50],
    '52': exports.all[51],
    '53': exports.all[52],
    '54': exports.all[53],
    '55': exports.all[54],
    '56': exports.all[55],
    '57': exports.all[56],
    '58': exports.all[57],
    '59': exports.all[58]
};
exports.code = {
    'UNKNOWN': exports.all[0],
    'OK': exports.all[1],
    'EOF': exports.all[2],
    'EADDRINFO': exports.all[3],
    'EACCES': exports.all[4],
    'EAGAIN': exports.all[5],
    'EADDRINUSE': exports.all[6],
    'EADDRNOTAVAIL': exports.all[7],
    'EAFNOSUPPORT': exports.all[8],
    'EALREADY': exports.all[9],
    'EBADF': exports.all[10],
    'EBUSY': exports.all[11],
    'ECONNABORTED': exports.all[12],
    'ECONNREFUSED': exports.all[13],
    'ECONNRESET': exports.all[14],
    'EDESTADDRREQ': exports.all[15],
    'EFAULT': exports.all[16],
    'EHOSTUNREACH': exports.all[17],
    'EINTR': exports.all[18],
    'EINVAL': exports.all[19],
    'EISCONN': exports.all[20],
    'EMFILE': exports.all[21],
    'EMSGSIZE': exports.all[22],
    'ENETDOWN': exports.all[23],
    'ENETUNREACH': exports.all[24],
    'ENFILE': exports.all[25],
    'ENOBUFS': exports.all[26],
    'ENOMEM': exports.all[27],
    'ENOTDIR': exports.all[28],
    'EISDIR': exports.all[29],
    'ENONET': exports.all[30],
    'ENOTCONN': exports.all[31],
    'ENOTSOCK': exports.all[32],
    'ENOTSUP': exports.all[33],
    'ENOENT': exports.all[34],
    'ENOSYS': exports.all[35],
    'EPIPE': exports.all[36],
    'EPROTO': exports.all[37],
    'EPROTONOSUPPORT': exports.all[38],
    'EPROTOTYPE': exports.all[39],
    'ETIMEDOUT': exports.all[40],
    'ECHARSET': exports.all[41],
    'EAIFAMNOSUPPORT': exports.all[42],
    'EAISERVICE': exports.all[43],
    'EAISOCKTYPE': exports.all[44],
    'ESHUTDOWN': exports.all[45],
    'EEXIST': exports.all[46],
    'ESRCH': exports.all[47],
    'ENAMETOOLONG': exports.all[48],
    'EPERM': exports.all[49],
    'ELOOP': exports.all[50],
    'EXDEV': exports.all[51],
    'ENOTEMPTY': exports.all[52],
    'ENOSPC': exports.all[53],
    'EIO': exports.all[54],
    'EROFS': exports.all[55],
    'ENODEV': exports.all[56],
    'ESPIPE': exports.all[57],
    'ECANCELED': exports.all[58]
};
//# sourceMappingURL=errno.js.map