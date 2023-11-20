import { LightningElement, track, wire, api } from 'lwc';
import { createRecord, updateRecord, getRecord } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateProjectRecord from '@salesforce/apex/ProjectController.updateProjectRecord';
import { NavigationMixin } from 'lightning/navigation';
import PROJECT_OBJECT from '@salesforce/schema/Project__c';
import NAME_FIELD from '@salesforce/schema/Project__c.Name';
import OWNER_NAME from '@salesforce/schema/Project__c.OwnerId';
import DESCRIPTION_FIELD from '@salesforce/schema/Project__c.Description__c';
import STATUS_FIELD from '@salesforce/schema/Project__c.Status__c';
import PERC_COMPLETE_FIELD from '@salesforce/schema/Project__c.Perc_Complete__c';
import PROJECT_TEMPLATE_FIELD from '@salesforce/schema/Project__c.Project_Template__c';
import MILESTONE_TEMPLATE_FIELD from '@salesforce/schema/Milestone__c.Milestone_Template__c';
import TO_DO_ITEM_TEMPLATE_FIELD from '@salesforce/schema/To_Do_Item__c.To_Do_Item_Template__c';
import MILESTONE_FIELD from '@salesforce/schema/To_Do_Item__c.Milestone__c';

export default class ProjectFormCreate extends LightningElement {
    @track objectApiName = PROJECT_OBJECT;
    @track recordId;
    @track milestoneId;
    @track todoId;

    fields = [
        'Project_Template__c',
        MILESTONE_TEMPLATE_FIELD,
        TO_DO_ITEM_TEMPLATE_FIELD,
        'Name',
        'Description__c',
        'Milestones__r.To_do_items__c',
    ];

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Milestones__r',
        fields: ['Name', 'Status__c', 'Id', 'Description__c'],
        sortBy: ['Milestone__c.Name'],
        dataFields: ['Name', 'Description__c', 'Status__c', 'Milestone__c.Id']
    })
    milestones;

    @wire(getRelatedListRecords, {
        parentRecordId: '$milestoneId',
        relatedListId: 'To_Do_Items__r',
        fields: ['To_Do_Item__c.Name', 'To_Do_Item__c.Status__c', 'To_Do_Item__c.Milestone__c'],
    })
    todos;

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Project created",
            message: "Record ID: {0}",
            messageData: [
                {
                    url: `/lightning/r/Project__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.recordId = event.detail.id;
    }

    handleMilestoneSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Project created",
            message: "Record ID: {0}",
            messageData: [
                {
                    url: `/lightning/r/Project__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.milestoneId = event.detail.id;
    }

    handleMilestone(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        fields.Project__c = this.recordId;
        
        this.template.querySelector('lightning-record-form[data-id="milestoneForm"]').submit(fields);
        this.milestoneId = event.detail.id;
    }

    handleTodo(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        fields.Milestone__c = this.milestoneId;

        this.template.querySelector('lightning-record-form[data-id="todoForm"]').submit(fields);


        const evt = new ShowToastEvent({
            title: "To-Do Item created",
            message: "Record ID: {0}",
            messageData: [
                {
                    url: `/lightning/r/To_Do_Item__c/${event.detail.id}/view`,
                    label: event.detail.id,
                },
            ],
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.todoId = event.detail.id;
    }


}