The following enumerated technical debt and future work needs and ideas.

# Suggested Features
1. More robust RFP open and Closing
    1. Automatically open on date.
    2. Automatically close on date.
    3. Extend close date for all agencies.
    4. Extend close date for some agencies.
    5. View historical RFP's.
2. Login as agency with admin credentials.
3. Manage RFP downloadable documents, that is, have admin upload documents that the agencies will use to download when creating the application.
4. API integration with Quadrant platform.
5. Self service management of docusign credentials.
6. Self service managmennt of Service lines offered and specialies offered.
7. Rich text editor for background section

# Technical Debt
1. Unit, and Integration test with coverage.
2. The application was hardcoded to be closed ... GREP for TECHNICAL DEBT 
```html
    <ng-template #thenBlock>
        <div class="col-12 form-btn" *ngIf="showActionBtn">
            <button type="button" class="btn btn-primary"  [disabled]="true">Application Closed</button>
        </div>
    </ng-template>
```