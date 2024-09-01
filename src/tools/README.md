# outfit-app tools
Tools for use with outfit-app

## Backup Tool

First, install the `requests` python module:

```
$ pip install requests
```

To back up data, edit `outfit_backup.py` and set `SOURCE_URL` to the source of the data. Then run:
```
$ outfit_backup.py backup
```
Backup files will be writen to a subdirectory of `backup`.

To restore a set of data,  edit `outfit_backup.py` and set `DESTINATION_URL` to the source of the data. 

If needed, delete the current data from the destination server, by default in `/var/lib/outfit-data`. Stop the running instance of the service, then run:

```
$ sudo rm -rf /var/lib/outfit-data/*
$ mkdir /var/lib/outfit-data/images
```

Start the service, it needed.

Restore from backup with:
```
$ outfit_backup.py restore <path_to_backup>
```
