import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services';

@Component({
  selector: 'app-qualivis-page',
  templateUrl: './qualivis.component.html',
  styleUrls: ['./qualivis.component.scss'],
})
export class QualivisPageComponent implements OnInit {
  application: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(({ application }) => {
      this.application = application;
    });
  }
}
