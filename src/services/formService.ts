import Form from '../models/Form';
import Field from '../models/Field';
import Submission from '../models/Submission';
import { IForm } from '../models/Form';
import { IField } from '../models/Field';

export interface CreateFormData {
  title: string;
  description?: string;
}

export interface UpdateFormData {
  title?: string;
  description?: string;
}

export interface CreateFieldData {
  label: string;
  type: string;
  name: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  order?: number;
}

export interface UpdateFieldData {
  label?: string;
  type?: string;
  name?: string;
  required?: boolean;
  options?: string[];
  validation?: any;
  order?: number;
}

export class FormService {
  // Form CRUD operations
  async createForm(data: CreateFormData): Promise<IForm> {
    const form = new Form({
      title: data.title,
      description: data.description,
      version: 1,
      isActive: true,
    });
    return await form.save();
  }

  async getAllForms(): Promise<IForm[]> {
    return await Form.find({ isActive: true })
      .populate('fields')
      .sort({ createdAt: -1 });
  }

  async getFormById(id: string): Promise<IForm | null> {
    return await Form.findById(id).populate('fields');
  }

  async getActiveFormById(id: string): Promise<IForm | null> {
    return await Form.findOne({ _id: id, isActive: true }).populate('fields');
  }

  async updateForm(id: string, data: UpdateFormData): Promise<IForm | null> {
    return await Form.findByIdAndUpdate(
      id,
      { title: data.title, description: data.description },
      { new: true, runValidators: true }
    );
  }

  async deleteForm(id: string): Promise<boolean> {
    const form = await Form.findByIdAndDelete(id);
    if (!form) return false;

    // Delete associated fields and submissions
    await Field.deleteMany({ formId: id });
    await Submission.deleteMany({ formId: id });

    return true;
  }

  // Versioning: Create new version of form
  async createNewVersion(formId: string, data?: UpdateFormData): Promise<IForm | null> {
    const oldForm = await Form.findById(formId).populate('fields');
    if (!oldForm) return null;

    // Get all fields from old version
    const oldFields = oldForm.fields as any[];

    // Create new form version
    const newForm = new Form({
      title: data?.title || oldForm.title,
      description: data?.description !== undefined ? data.description : oldForm.description,
      version: oldForm.version + 1,
      isActive: true,
      previousVersion: oldForm._id,
    });

    await newForm.save();

    // Deactivate old version
    oldForm.isActive = false;
    await oldForm.save();

    // Copy fields to new version
    const newFields = [];
    for (const oldField of oldFields) {
      const newField = new Field({
        formId: newForm._id,
        label: oldField.label,
        type: oldField.type,
        name: oldField.name,
        required: oldField.required,
        options: oldField.options,
        validation: oldField.validation,
        order: oldField.order,
      });
      await newField.save();
      newFields.push(newField._id);
    }

    newForm.fields = newFields as any[];
    await newForm.save();

    return await Form.findById(newForm._id).populate('fields');
  }

  // Field CRUD operations
  async createField(formId: string, data: CreateFieldData): Promise<IField> {
    const form = await Form.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }

    const field = new Field({
      formId,
      label: data.label,
      type: data.type,
      name: data.name,
      required: data.required || false,
      options: data.options || [],
      validation: data.validation,
      order: data.order || 0,
    });

    await field.save();

    // Add field to form
    form.fields.push(field._id as any);
    await form.save();

    return field;
  }

  async getFieldById(formId: string, fieldId: string): Promise<IField | null> {
    return await Field.findOne({ _id: fieldId, formId });
  }

  async updateField(formId: string, fieldId: string, data: UpdateFieldData): Promise<IField | null> {
    const field = await Field.findOne({ _id: fieldId, formId });
    if (!field) return null;

    if (data.label !== undefined) field.label = data.label;
    if (data.type !== undefined) field.type = data.type as any;
    if (data.name !== undefined) field.name = data.name;
    if (data.required !== undefined) field.required = data.required;
    if (data.options !== undefined) field.options = data.options;
    if (data.validation !== undefined) field.validation = data.validation;
    if (data.order !== undefined) field.order = data.order;

    return await field.save();
  }

  async deleteField(formId: string, fieldId: string): Promise<boolean> {
    const field = await Field.findOneAndDelete({ _id: fieldId, formId });
    if (!field) return false;

    // Remove field from form
    await Form.findByIdAndUpdate(formId, {
      $pull: { fields: fieldId },
    });

    return true;
  }

  async reorderFields(formId: string, fieldOrders: { fieldId: string; order: number }[]): Promise<IForm | null> {
    const updatePromises = fieldOrders.map(({ fieldId, order }) =>
      Field.findOneAndUpdate(
        { _id: fieldId, formId },
        { order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return await Form.findById(formId).populate({
      path: 'fields',
      options: { sort: { order: 1 } },
    });
  }
}

