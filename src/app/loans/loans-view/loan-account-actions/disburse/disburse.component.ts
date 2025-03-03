/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Disburse Loan Option
 */
@Component({
  selector: 'mifosx-disburse',
  templateUrl: './disburse.component.html',
  styleUrls: ['./disburse.component.scss']
})
export class DisburseComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan Form */
  disbursementLoanForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }


  /**
   * Creates the disbursement loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.createDisbursementLoanForm();
    this.setDisbursementLoanDetails();
  }

  /**
   * Creates the disbursement loan form.
   */
  createDisbursementLoanForm() {
    this.disbursementLoanForm = this.formBuilder.group({
      'actualDisbursementDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': '',
      'note': ''
    });
  }

  setDisbursementLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.disbursementLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      // actualDisbursementDate: new Date(this.dataObject.date)
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.disbursementLoanForm.addControl('accountNumber', new FormControl(''));
      this.disbursementLoanForm.addControl('checkNumber', new FormControl(''));
      this.disbursementLoanForm.addControl('routingCode', new FormControl(''));
      this.disbursementLoanForm.addControl('receiptNumber', new FormControl(''));
      this.disbursementLoanForm.addControl('bankNumber', new FormControl(''));
    } else {
      this.disbursementLoanForm.removeControl('accountNumber');
      this.disbursementLoanForm.removeControl('checkNumber');
      this.disbursementLoanForm.removeControl('routingCode');
      this.disbursementLoanForm.removeControl('receiptNumber');
      this.disbursementLoanForm.removeControl('bankNumber');
    }
  }

  /** Submits the disbursement form */
  submit() {
    const disbursementLoanFormData = this.disbursementLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementLoanForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(prevActualDisbursementDate, dateFormat);
    }
    const data = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.loanActionButtons(this.loanId, 'disburse', data )
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }

}
