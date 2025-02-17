import { Component, OnInit } from '@angular/core';
import { ymlService } from '../../service/yaml-parser/yaml-parser.service';
import { MatTableDataSource } from '@angular/material/table';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as XLSX from 'xlsx';

export interface MappingElementSortedByTask {
  dimension: string;
  subDimension: string;
  taskName: string;
  samm2: string[];
  ISO: string[];
  ISO22: string[];
}

export interface MappingElementSortedBySAMM {
  samm2: string;
  dimension: string;
  subDimension: string;
  taskName: string;
  ISO: string[];
  ISO22: string[];
}

export interface MappingElementSortedByISO {
  ISO: string;
  ISO22: string[];
  dimension: string;
  subDimension: string;
  taskName: string;
  samm2: string[];
  description: string;
  risk: string;
  measure: string;
  knowledge: string;
  resources: string;
  time: string;
  usefulness: string;
  dependsOn: string[];
  evidence: string;
  comments: string;
  assessment: string;
  implementation: any;
}

export interface MappingElementSortedByISO22 {
  ISO: string[];
  ISO22: string;
  dimension: string;
  subDimension: string;
  taskName: string;
  samm2: string[];
  description: string;
  risk: string;
  measure: string;
  knowledge: string;
  resources: string;
  time: string;
  usefulness: string;
  dependsOn: string[];
  evidence: string;
  comments: string;
  assessment: string;
  implementation: any;
}

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css'],
})
export class MappingComponent implements OnInit {
  allMappingDataSortedByTask: MappingElementSortedByTask[] = [];
  plannedMappingDataSortedByTask: MappingElementSortedByTask[] = [];
  performedMappingDataSortedByTask: MappingElementSortedByTask[] = [];
  currentlySortingByTask: boolean = true;

  allMappingDataSortedBySAMM: MappingElementSortedBySAMM[] = [];
  plannedMappingDataSortedBySAMM: MappingElementSortedBySAMM[] = [];
  performedMappingDataSortedBySAMM: MappingElementSortedBySAMM[] = [];
  currentlySortingBySAMM: boolean = false;

  allMappingDataSortedByISO: MappingElementSortedByISO[] = [];
  plannedMappingDataSortedByISO: MappingElementSortedByISO[] = [];
  performedMappingDataSortedByISO: MappingElementSortedByISO[] = [];
  currentlySortingByISO: boolean = false;

  allMappingDataSortedByISO22: MappingElementSortedByISO22[] = [];
  plannedMappingDataSortedByISO22: MappingElementSortedByISO22[] = [];
  performedMappingDataSortedByISO22: MappingElementSortedByISO22[] = [];
  currentlySortingByISO22: boolean = false;

  dataSource: any = new MatTableDataSource<MappingElementSortedByTask>(
    this.allMappingDataSortedByTask
  );
  YamlObject: any;

  displayedColumns: string[] = [
    'dimension',
    'subDimension',
    'taskName',
    'samm2',
    'ISO',
    'ISO22',
  ];
  allDimensionNames: string[] = [];
  temporaryMappingElement: any;

  //labels
  knowledgeLabels: string[] = [];
  generalLabels: string[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  FilterCtrl = new FormControl('');
  SortCtrl = new FormControl('');
  filteredChips: Observable<string[]>;
  currentChip: string[] = [];
  allChips: string[] = ['Performed Activities', 'Planned Activities'];

  @ViewChild('chipInput') chipInput!: ElementRef<HTMLInputElement>;

  constructor(private yaml: ymlService) {
    this.filteredChips = this.FilterCtrl.valueChanges.pipe(
      startWith(null),
      map((x: string | null) => (x ? this._filter(x) : this.allChips.slice()))
    );
  }

  ngOnInit(): void {
    //gets value from meta folder
    this.yaml.setURI('./assets/YAML/meta.yaml');
    // Function sets label data
    this.yaml.getJson().subscribe(data => {
      //console.log(data)
      this.knowledgeLabels = data['strings']['en']['KnowledgeLabels'];
      this.generalLabels = data['strings']['en']['labels'];
    });
    //gets value from generated folder
    this.yaml.setURI('./assets/YAML/generated/generated.yaml');
    // Function sets data
    this.yaml.getJson().subscribe(data => {
      this.YamlObject = data;
      this.allDimensionNames = Object.keys(this.YamlObject);
      for (let i = 0; i < this.allDimensionNames.length; i++) {
        var subdimensionsInCurrentDimension = Object.keys(
          this.YamlObject[this.allDimensionNames[i]]
        );
        for (let j = 0; j < subdimensionsInCurrentDimension.length; j++) {
          var taskInCurrentSubDimension: string[] = Object.keys(
            this.YamlObject[this.allDimensionNames[i]][
              subdimensionsInCurrentDimension[j]
            ]
          );
          for (let a = 0; a < taskInCurrentSubDimension.length; a++) {
            this.setValueandAppendToDatasetSortedbyTask(
              this.allDimensionNames[i],
              subdimensionsInCurrentDimension[j],
              taskInCurrentSubDimension[a]
            );
            this.setValueandAppendToDatasetandSortbySAMM(
              this.allDimensionNames[i],
              subdimensionsInCurrentDimension[j],
              taskInCurrentSubDimension[a]
            );
            this.setValueandAppendToDatasetandSortbyISO(
              this.allDimensionNames[i],
              subdimensionsInCurrentDimension[j],
              taskInCurrentSubDimension[a]
            );
            this.setValueandAppendToDatasetandSortbyISO22(
              this.allDimensionNames[i],
              subdimensionsInCurrentDimension[j],
              taskInCurrentSubDimension[a]
            );
          }
        }
      }
      // weird fix to render DOM for table viewing in angular material
      this.dataSource._data.next(this.allMappingDataSortedByTask);
    });
    //console.log(this.allMappingDataSortedByTask)
    //console.log(this.allMappingDataSortedBySAMM)
    //console.log(this.allMappingDataSortedByISO)
    //this.dataSource=new MatTableDataSource([...this.dataSource]);
    //console.log(this.dataSource.data)
  }

  //Sets dataSource value sorted by task
  setValueandAppendToDatasetSortedbyTask(
    dim: string,
    subDim: string,
    task: string
  ) {
    var ISOArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2017'];
    var ISO22Array: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2022'];
    var SAMMArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['samm2'];
    this.temporaryMappingElement = {
      dimension: dim,
      subDimension: subDim,
      taskName: task,
      ISO: ISOArray,
      ISO22: ISO22Array,
      samm2: SAMMArray,
    };
    //console.log(this.temp)
    this.allMappingDataSortedByTask.push(this.temporaryMappingElement);
    if (this.YamlObject[dim][subDim][task]['isImplemented']) {
      this.performedMappingDataSortedByTask.push(this.temporaryMappingElement);
    } else {
      this.plannedMappingDataSortedByTask.push(this.temporaryMappingElement);
    }
  }

  //Sets dataSource value sorted by SAMM
  setValueandAppendToDatasetandSortbySAMM(
    dim: string,
    subDim: string,
    task: string
  ) {
    var ISOArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2017'];
    var ISO22Array: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2022'];
    var SAMMArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['samm2'];
    this.temporaryMappingElement = {
      dimension: dim,
      subDimension: subDim,
      taskName: task,
      ISO: ISOArray,
      ISO22: ISO22Array,
      samm2: '',
    };
    if (SAMMArray.length == 0) {
      this.allMappingDataSortedBySAMM.push(this.temporaryMappingElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedBySAMM.push(
          this.temporaryMappingElement
        );
      } else {
        this.plannedMappingDataSortedBySAMM.push(this.temporaryMappingElement);
      }
    }
    for (var i = 0; i < SAMMArray.length; i++) {
      const newTempElement = JSON.parse(
        JSON.stringify(this.temporaryMappingElement)
      );
      newTempElement['samm2'] = SAMMArray[i];
      this.allMappingDataSortedBySAMM.push(newTempElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedBySAMM.push(newTempElement);
      } else {
        this.plannedMappingDataSortedBySAMM.push(newTempElement);
      }
    }
    //sorting by descending order
    this.allMappingDataSortedBySAMM.sort(
      (first, second) => 0 - (first['samm2'] > second['samm2'] ? 1 : -1)
    );
    this.plannedMappingDataSortedBySAMM.sort(
      (first, second) => 0 - (first['samm2'] > second['samm2'] ? 1 : -1)
    );
    this.performedMappingDataSortedBySAMM.sort(
      (first, second) => 0 - (first['samm2'] > second['samm2'] ? 1 : -1)
    );
    //console.log(this.temp)
  }

  //Sets dataSource value sorted by ISO 27001:2017 - to also be used by download functionality
  setValueandAppendToDatasetandSortbyISO(
    dim: string,
    subDim: string,
    task: string
  ) {
    var ISOArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2017'];
    var ISO22Array: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2022'];
    var SAMMArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['samm2'];
    var CurrentDescription: string =
      this.YamlObject[dim][subDim][task]['description'];
    var CurrentRisk: string = this.YamlObject[dim][subDim][task]['risk'];
    var CurrentMeasure: string = this.YamlObject[dim][subDim][task]['measure'];
    var CurrentKnowledge: string =
      this.knowledgeLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation'][
          'knowledge'
        ]
      ];
    var CurrentTime: string =
      this.generalLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation']['time']
      ];
    var CurrentResources: string =
      this.generalLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation'][
          'resources'
        ]
      ];
    var CurrentUsefulness: string =
      this.generalLabels[this.YamlObject[dim][subDim][task]['usefulness']];

    var CurrentEvidence: string =
      this.YamlObject[dim][subDim][task]['evidence'];

    var CurrentComments: string =
      this.YamlObject[dim][subDim][task]['comments'];

    var CurrentAssessment: string =
      this.YamlObject[dim][subDim][task]['assessment'];

    var CurrentDependsOn: string[] =
      this.YamlObject[dim][subDim][task]['dependsOn'];
    try {
      var CurrentImplementation: any = JSON.stringify(
        this.YamlObject[dim][subDim][task]['implementation']
      );
      if (CurrentImplementation.length == 2) {
        CurrentImplementation = '';
      }
    } catch {
      CurrentImplementation = '';
    }

    this.temporaryMappingElement = {
      dimension: dim,
      subDimension: subDim,
      taskName: task,
      ISO: '',
      ISO22: ISO22Array,
      samm2: SAMMArray,
      description: CurrentDescription,
      risk: CurrentRisk,
      measure: CurrentMeasure,
      knowledge: CurrentKnowledge,
      time: CurrentTime,
      resources: CurrentResources,
      usefulness: CurrentUsefulness,
      dependsOn: CurrentDependsOn,
      implementation: CurrentImplementation,
      evidence: CurrentEvidence,
      comments: CurrentComments,
      assessment: CurrentAssessment,
    };
    if (ISOArray.length == 0) {
      this.allMappingDataSortedByISO.push(this.temporaryMappingElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedByISO.push(this.temporaryMappingElement);
      } else {
        this.plannedMappingDataSortedByISO.push(this.temporaryMappingElement);
      }
    }
    for (var i = 0; i < ISOArray.length; i++) {
      const newTempElement = JSON.parse(
        JSON.stringify(this.temporaryMappingElement)
      );
      newTempElement['ISO'] = ISOArray[i];
      //console.log(newTempElement);
      this.allMappingDataSortedByISO.push(newTempElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedByISO.push(newTempElement);
      } else {
        this.plannedMappingDataSortedByISO.push(newTempElement);
      }
    }
    //sorting by descending order
    this.allMappingDataSortedByISO.sort(
      (first, second) => 0 - (first['ISO'] > second['ISO'] ? 1 : -1)
    );
    this.performedMappingDataSortedByISO.sort(
      (first, second) => 0 - (first['ISO'] > second['ISO'] ? 1 : -1)
    );
    this.plannedMappingDataSortedByISO.sort(
      (first, second) => 0 - (first['ISO'] > second['ISO'] ? 1 : -1)
    );
    //console.log(this.temp)
  }

  //Sets dataSource value sorted by ISO 27001:2022
  setValueandAppendToDatasetandSortbyISO22(
    dim: string,
    subDim: string,
    task: string
  ) {
    var ISOArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2017'];
    var ISO22Array: string[] =
      this.YamlObject[dim][subDim][task]['references']['iso27001-2022'];
    var SAMMArray: string[] =
      this.YamlObject[dim][subDim][task]['references']['samm2'];
    var CurrentDescription: string =
      this.YamlObject[dim][subDim][task]['description'];
    var CurrentRisk: string = this.YamlObject[dim][subDim][task]['risk'];
    var CurrentMeasure: string = this.YamlObject[dim][subDim][task]['measure'];
    var CurrentKnowledge: string =
      this.knowledgeLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation'][
          'knowledge'
        ]
      ];
    var CurrentTime: string =
      this.generalLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation']['time']
      ];
    var CurrentResources: string =
      this.generalLabels[
        this.YamlObject[dim][subDim][task]['difficultyOfImplementation'][
          'resources'
        ]
      ];
    var CurrentUsefulness: string =
      this.generalLabels[this.YamlObject[dim][subDim][task]['usefulness']];

    var CurrentEvidence: string =
      this.YamlObject[dim][subDim][task]['evidence'];

    var CurrentComments: string =
      this.YamlObject[dim][subDim][task]['comments'];

    var CurrentAssessment: string =
      this.YamlObject[dim][subDim][task]['assessment'];

    var CurrentDependsOn: string[] =
      this.YamlObject[dim][subDim][task]['dependsOn'];
    try {
      var CurrentImplementation: any = JSON.stringify(
        this.YamlObject[dim][subDim][task]['implementation']
      );
      if (CurrentImplementation.length == 2) {
        CurrentImplementation = '';
      }
    } catch {
      CurrentImplementation = '';
    }

    this.temporaryMappingElement = {
      dimension: dim,
      subDimension: subDim,
      taskName: task,
      ISO: ISOArray,
      ISO22: '',
      samm2: SAMMArray,
      description: CurrentDescription,
      risk: CurrentRisk,
      measure: CurrentMeasure,
      knowledge: CurrentKnowledge,
      time: CurrentTime,
      resources: CurrentResources,
      usefulness: CurrentUsefulness,
      dependsOn: CurrentDependsOn,
      implementation: CurrentImplementation,
      evidence: CurrentEvidence,
      comments: CurrentComments,
      assessment: CurrentAssessment,
    };
    if (ISO22Array.length == 0) {
      this.allMappingDataSortedByISO22.push(this.temporaryMappingElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedByISO22.push(
          this.temporaryMappingElement
        );
      } else {
        this.plannedMappingDataSortedByISO22.push(this.temporaryMappingElement);
      }
    }
    for (var i = 0; i < ISO22Array.length; i++) {
      const newTempElement = JSON.parse(
        JSON.stringify(this.temporaryMappingElement)
      );
      newTempElement['ISO22'] = ISO22Array[i];
      //console.log(newTempElement);
      this.allMappingDataSortedByISO22.push(newTempElement);
      if (this.YamlObject[dim][subDim][task]['isImplemented']) {
        this.performedMappingDataSortedByISO22.push(newTempElement);
      } else {
        this.plannedMappingDataSortedByISO22.push(newTempElement);
      }
    }
    //sorting by descending order
    this.allMappingDataSortedByISO22.sort(
      (first, second) => 0 - (first['ISO22'] > second['ISO22'] ? 1 : -1)
    );
    this.performedMappingDataSortedByISO22.sort(
      (first, second) => 0 - (first['ISO22'] > second['ISO22'] ? 1 : -1)
    );
    this.plannedMappingDataSortedByISO22.sort(
      (first, second) => 0 - (first['ISO22'] > second['ISO22'] ? 1 : -1)
    );
    //console.log(this.temp)
  }

  // remove filter chip
  removeChip(chip: string): void {
    const index = this.currentChip.indexOf(chip);
    if (index >= 0) {
      this.currentChip.splice(index, 1);
    }
    this.changeTableBasedOnCurrentFilter();
  }

  //adding filter chip
  addChip(event: MatAutocompleteSelectedEvent): void {
    this.currentChip.push(event.option.viewValue);
    this.changeTableBasedOnCurrentFilter();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allChips.filter(chip =>
      chip.toLowerCase().includes(filterValue)
    );
  }

  //check sort value and change table data accordingly
  checkSortValueAndChangeTableData(
    taskData: any,
    ISOData: any,
    ISO22Data: any,
    SAMMData: any
  ): void {
    if (this.currentlySortingByTask) {
      this.dataSource = taskData;
    } else if (this.currentlySortingByISO) {
      this.dataSource = ISOData;
    } else if (this.currentlySortingByISO22) {
      this.dataSource = ISO22Data;
    } else {
      this.dataSource = SAMMData;
    }
  }

  changeTableBasedOnCurrentFilter() {
    if (this.currentChip.length > 1 || this.currentChip.length == 0) {
      // both planned and performed actvities are selected

      //Check current sort value
      this.checkSortValueAndChangeTableData(
        this.allMappingDataSortedByTask,
        this.allMappingDataSortedByISO,
        this.allMappingDataSortedByISO22,
        this.allMappingDataSortedBySAMM
      );
    } else if (this.currentChip[0] == 'Planned Activities') {
      // planned actvities shows planned data

      //Check current sort value
      this.checkSortValueAndChangeTableData(
        this.plannedMappingDataSortedByTask,
        this.plannedMappingDataSortedByISO,
        this.plannedMappingDataSortedByISO22,
        this.plannedMappingDataSortedBySAMM
      );
    } else {
      //Check current sort value
      this.checkSortValueAndChangeTableData(
        this.performedMappingDataSortedByTask,
        this.performedMappingDataSortedByISO,
        this.performedMappingDataSortedByISO22,
        this.performedMappingDataSortedBySAMM
      );
    }

    this.chipInput.nativeElement.value = '';
    this.FilterCtrl.setValue(null);
  }

  changeTableBasedOnCurrentSort() {
    if (this.SortCtrl.value == 'sortByTask') {
      this.currentlySortingByTask = true;
      this.currentlySortingBySAMM = false;
      this.currentlySortingByISO = false;
      this.currentlySortingByISO22 = false;

      //Checking filters
      if (this.currentChip.length > 1 || this.currentChip.length == 0) {
        // both planned and performed actvities are selected
        this.dataSource = this.allMappingDataSortedByTask;
      } else {
        if (this.currentChip[0] == 'Planned Activities') {
          // planned actvities shows planned data
          this.dataSource = this.plannedMappingDataSortedByTask;
        } else {
          // performed actvities shows performed data
          this.dataSource = this.performedMappingDataSortedByTask;
        }
      }
    } else if (this.SortCtrl.value == 'sortBySAMM') {
      this.currentlySortingByTask = false;
      this.currentlySortingBySAMM = true;
      this.currentlySortingByISO = false;
      this.currentlySortingByISO22 = false;

      //Checking filters
      if (this.currentChip.length > 1 || this.currentChip.length == 0) {
        // both planned and performed actvities are selected
        this.dataSource = this.allMappingDataSortedBySAMM;
      } else {
        if (this.currentChip[0] == 'Planned Activities') {
          // planned actvities shows planned data
          this.dataSource = this.plannedMappingDataSortedBySAMM;
        } else {
          // performed actvities shows performed data
          this.dataSource = this.performedMappingDataSortedBySAMM;
        }
      }
    } else if (this.SortCtrl.value == 'sortByISO') {
      this.currentlySortingByTask = false;
      this.currentlySortingBySAMM = false;
      this.currentlySortingByISO = true;
      this.currentlySortingByISO22 = false;

      //Checking filters
      if (this.currentChip.length > 1 || this.currentChip.length == 0) {
        // both planned and performed actvities are selected
        this.dataSource = this.allMappingDataSortedByISO;
      } else {
        if (this.currentChip[0] == 'Planned Activities') {
          // planned actvities shows planned data
          this.dataSource = this.plannedMappingDataSortedByISO;
        } else {
          // performed actvities shows performed data
          this.dataSource = this.performedMappingDataSortedByISO;
        }
      }
    } else {
      this.currentlySortingByTask = false;
      this.currentlySortingBySAMM = false;
      this.currentlySortingByISO = false;
      this.currentlySortingByISO22 = true;

      //Checking filters
      if (this.currentChip.length > 1 || this.currentChip.length == 0) {
        // both planned and performed actvities are selected
        this.dataSource = this.allMappingDataSortedByISO22;
      } else {
        if (this.currentChip[0] == 'Planned Activities') {
          // planned actvities shows planned data
          this.dataSource = this.plannedMappingDataSortedByISO22;
        } else {
          // performed actvities shows performed data
          this.dataSource = this.performedMappingDataSortedByISO22;
        }
      }
    }
  }

  exportToExcel() {
    //passing the table id
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    //generate workbook and add the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    //save to file
    XLSX.writeFile(wb, 'Planned-Activities-Sorted-By-ISO.xlsx');
    //console.log(this.allMappingDataSortedByISO)
  }
}
