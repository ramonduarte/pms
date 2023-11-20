import { LightningElement, track, wire, api } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PROJECT_OBJECT from '@salesforce/schema/Project__c';
import MILESTONE_TEMPLATE_FIELD from '@salesforce/schema/Milestone__c.Milestone_Template__c';
import TO_DO_ITEM_TEMPLATE_FIELD from '@salesforce/schema/To_Do_Item__c.To_Do_Item_Template__c';

export default class ProjectFormCreate extends LightningElement {
    @track objectApiName = PROJECT_OBJECT;
    @track recordId;
    @track milestoneId;
    @track todoId;

    // Fields to be displayed in the form
    // Name & Description are agnostic
    fields = [
        'Project_Template__c',
        MILESTONE_TEMPLATE_FIELD,
        TO_DO_ITEM_TEMPLATE_FIELD,
        'Name',
        'Description__c',
    ];

    // Wire method to fetch related milestones
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Milestones__r',
        fields: ['Name', 'Status__c', 'Id', 'Description__c'],
        sortBy: ['Milestone__c.Name'],
        dataFields: ['Name', 'Description__c', 'Status__c', 'Milestone__c.Id'],
    })
    milestones;

    // Wire method to fetch related to-do items
    @wire(getRelatedListRecords, {
        parentRecordId: '$milestoneId',
        relatedListId: 'To_Do_Items__r',
        fields: ['To_Do_Item__c.Name', 'To_Do_Item__c.Status__c', 'To_Do_Item__c.Milestone__c'],
    })
    todos;

    // Handle success for Project creation
    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Project created',
            message: 'Record ID: {0}',
            messageData: [
                {
                    url: `/lightning/r/Project__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: 'success',
        });
        this.dispatchEvent(evt);
        this.recordId = event.detail.id;
    }

    // Handle success for Milestone creation
    handleMilestoneSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Milestone created',
            message: 'Record ID: {0}',
            messageData: [
                {
                    url: `/lightning/r/Project__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: 'success',
        });
        this.dispatchEvent(evt);
        this.milestoneId = event.detail.id;
    }

    // Handle Milestone form submission
    // specifically to get the Project Id
    handleMilestone(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        fields.Project__c = this.recordId;

        // Submit Milestone form
        this.template.querySelector('lightning-record-form[data-id="milestoneForm"]').submit(fields);
        this.milestoneId = event.detail.id;
    }

    // Handle To-Do Item form submission
    // specifically to get the Milestone Id
    handleTodo(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        fields.Milestone__c = this.milestoneId;

        // Submit To-Do Item form
        this.template.querySelector('lightning-record-form[data-id="todoForm"]').submit(fields);

        // Show success message for To-Do Item creation
        const evt = new ShowToastEvent({
            title: 'To-Do Item created',
            message: 'Record ID: {0}',
            messageData: [
                {
                    url: `/lightning/r/To_Do_Item__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: 'success',
        });
        this.dispatchEvent(evt);
        this.todoId = event.detail.id;
    }
}
