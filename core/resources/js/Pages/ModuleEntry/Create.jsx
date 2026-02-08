import React, { useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { buildEmptyData, renderFieldInput } from './entryFormHelpers';

const Create = ({ module, mappedModuleEntries = {} }) => {
    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const mappingEnabled = !!module?.mapping_enabled;
    const mappingFields = useMemo(() => (Array.isArray(module?.mapping_config) ? module.mapping_config : []), [module]);
    const typesEnabled = !!module?.types_enabled;
    const types = useMemo(() => (Array.isArray(module?.types) ? module.types : []), [module]);

    const initialMappingData = useMemo(() => {
        const base = {};
        (mappingFields || []).forEach((mf) => {
            if (mf?.name) base[mf.name] = [];
        });
        return base;
    }, [mappingFields]);

    const { data, setData, post, processing, errors } = useForm({
        type: '',
        data: buildEmptyData(fields),
        mapping_data: initialMappingData,
        sort_order: 0,
        is_active: true,
    });

    const addMappingItem = (fieldName) => {
        setData('mapping_data', {
            ...(data.mapping_data || {}),
            [fieldName]: [...(data.mapping_data?.[fieldName] || []), ''],
        });
    };

    const removeMappingItem = (fieldName, index) => {
        const arr = [...(data.mapping_data?.[fieldName] || [])];
        arr.splice(index, 1);
        setData('mapping_data', { ...(data.mapping_data || {}), [fieldName]: arr });
    };

    const updateMappingItem = (fieldName, index, value) => {
        const arr = [...(data.mapping_data?.[fieldName] || [])];
        arr[index] = value;
        setData('mapping_data', { ...(data.mapping_data || {}), [fieldName]: arr });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('modules.entries.store', module.id));
    };

    return (
        <>
            <h1 className="text-muted">Add {module?.name}</h1>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="row g-3">
                            {typesEnabled && types.length > 0 && (
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors?.type ? 'is-invalid' : ''}`}
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {types.map((type, idx) => (
                                            <option key={idx} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors?.type && <div className="text-danger small">{errors.type}</div>}
                                </div>
                            )}

                            {fields.map((field) => (
                                <div key={field.name} className="col-md-6">
                                    <label className="form-label">
                                        {field.label || field.name}
                                        {field.required && <span className="text-danger"> *</span>}
                                    </label>
                                    {renderFieldInput(field, data.data[field.name], (v) => setData('data', { ...data.data, [field.name]: v }))}
                                    {errors?.[`data.${field.name}`] && (
                                        <div className="text-danger small">{errors[`data.${field.name}`]}</div>
                                    )}
                                </div>
                            ))}

                            {mappingEnabled && mappingFields.length > 0 && (
                                <div className="col-12">
                                    <h6 className="mb-3">Repeatable Items (each field has its own array)</h6>
                                    <div className="d-flex flex-column gap-4">
                                        {mappingFields.map((mf) => (
                                            <div key={mf.name} className="border rounded p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <strong>{mf.label || mf.name}</strong>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => addMappingItem(mf.name)}
                                                    >
                                                        <i className="bx bx-plus me-1"></i>
                                                        Add Item
                                                    </button>
                                                </div>
                                                {(data.mapping_data?.[mf.name] || []).length === 0 ? (
                                                    <div className="text-muted small">No items yet.</div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        {(data.mapping_data?.[mf.name] || []).map((val, idx) => (
                                                            <div key={idx} className="d-flex align-items-center gap-2">
                                                                <div className="flex-grow-1">
                                                                    {renderFieldInput(
                                                                        mf,
                                                                        val,
                                                                        (v) => updateMappingItem(mf.name, idx, v),
                                                                        { moduleEntries: mappedModuleEntries }
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => removeMappingItem(mf.name, idx)}
                                                                >
                                                                    <i className="bx bx-trash"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {errors?.[`mapping_data.${mf.name}`] && (
                                                    <div className="text-danger small mt-1">{errors[`mapping_data.${mf.name}`]}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="col-12 mt-2">
                                <button type="submit" className="btn btn-primary me-2" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bx bx-save me-2"></i>
                                            Save
                                        </>
                                    )}
                                </button>
                                <Link href={route('modules.entries.index', module.id)} className="btn btn-secondary">
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Create;
