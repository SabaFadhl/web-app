/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Create Office component.
 */
@Component({
  selector: 'mifosx-create-office',
  templateUrl: './create-office.component.html',
  styleUrls: ['./create-office.component.scss']
})
export class CreateOfficeComponent implements OnInit {

  /** Office form. */
  officeForm: FormGroup;
  /** Office Data */
  officeData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private router: Router,
              private route: ActivatedRoute,
              private dateUtils: Dates) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.createofficeForm();
  }

  /**
   * Creates the Office Form
   */
  createofficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'parentId': ['', Validators.required],
      'openingDate': ['', Validators.required],
      'externalId': [''],
    });
  }

  /**
   * Submits the office form and creates office.
   * if successful redirects to offices
   */
  submit() {
    const officeFormData = this.officeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpeningDate: Date = this.officeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpeningDate, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale
    };
    this.organizationService.createOffice(data).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
