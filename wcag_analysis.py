import os
import csv
import json


# Read reports
csv_files = [f for f in os.listdir('reports')]

# Collect unique WCAG codes
fileinfos = {}

for filename in csv_files:

    print(f'Processing {filename}')
    file_codes = {}

    with open(os.path.join('reports', filename)) as csvfile:
        # next(csvfile)
        reader = csv.reader(csvfile)

        for row in reader:
            code = row[0]
            # type_code = row[4]

            if code == 'code':
                continue
            elif code in file_codes.keys():
                file_codes[code] += 1
            else:
                print('else')
                file_codes[code] = 1
                print(file_codes)

    fileinfos[filename] = file_codes

    with open(f'{filename}.json', 'w') as fp:
        json.dump(file_codes, fp)

with open('all_info.json', 'w') as fa:
    json.dump(fileinfos, fa)
