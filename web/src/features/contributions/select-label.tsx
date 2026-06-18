import { useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useState, useMemo, useEffect, useRef } from 'react';
import {
  Select,
  SelectValue,
  SelectOption,
  SelectType,
} from '../../components/inputs/select';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ILabelSummary, LABEL_REFERENCE_PATTERN } from 'shared';

const formatLabelLabel = (label: ILabelSummary) =>
  label.name +
  (label.nameLatin ? ` [${label.nameLatin}]` : '') +
  (label.disambiguation ? ` (${label.disambiguation})` : '');

interface SelectLabelProps {
  value?: SelectValue;
  onChange: (value: SelectValue, selected?: SelectType | null) => void;
  name?: string;
  placeholder?: string;
  isMulti: boolean;
  icon?: React.ReactNode;
  availableLabels?: ILabelSummary[];
}

export const SelectLabel = forwardRef<any, SelectLabelProps>(
  (
    {
      placeholder = 'Labels',
      onChange,
      isMulti,
      value,
      availableLabels,
      ...rest
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const { snackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const availableOptionsRegistry = useRef<Map<string, SelectOption>>(
      new Map(),
    );

    // Add available labels to registry
    useEffect(() => {
      if (availableLabels) {
        availableLabels.forEach(
          (label) =>
            !availableOptionsRegistry.current.has(label.id) &&
            availableOptionsRegistry.current.set(label.id, {
              value: label.id,
              label: formatLabelLabel(label),
            }),
        );
      }
    }, [availableLabels]);

    const selectedLabels = useMemo(() => {
      return Array.isArray(value)
        ? value.map((v) => availableOptionsRegistry.current.get(v))
        : availableOptionsRegistry.current.get(value);
    }, [value, availableOptionsRegistry]);

    const valueArray = useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    const hasAllLocalData = valueArray.every((id) =>
      availableOptionsRegistry.current.has(id),
    );

    const { data: fetchedLabels } = useQuery({
      queryKey: cacheKeys.labelsKey(valueArray),
      queryFn: () => api.getLabels(valueArray),
      enabled: valueArray.length > 0 && !hasAllLocalData,
    });

    useEffect(() => {
      if (fetchedLabels) {
        fetchedLabels.forEach((l) => {
          availableOptionsRegistry.current.set(l.id, {
            value: l.id,
            label: formatLabelLabel(l),
          });
        });
      }
    }, [fetchedLabels]);

    const { data } = useQuery(
      cacheKeys.searchKey({
        q: query!,
        type: ['labels'],
        page: 1,
        pageSize: 12,
      }),
      () =>
        api.search({
          q: query!,
          type: ['labels'],
          page: 1,
          pageSize: 12,
        }),
      { enabled: !!query },
    );

    const handleOnChange = (selected: SelectType | null) => {
      if (!selected) {
        onChange(Array.isArray(value) ? [] : null, null);
        return;
      }

      const selectedArray = Array.isArray(selected) ? selected : [selected];
      selectedArray.forEach(
        (s) =>
          !availableOptionsRegistry.current.has(s.value) &&
          availableOptionsRegistry.current.set(s.value, {
            value: s.value,
            label: s.label,
          }),
      );

      const newValue = Array.isArray(selected)
        ? selected.map((s) => s.value)
        : selected.value;

      onChange(newValue, selected);
    };

    const handleInputChange = (v: string) => {
      const match = v.match(LABEL_REFERENCE_PATTERN);
      if (match) {
        const labelId = match[1];
        setQuery('');

        queryClient
          .fetchQuery(cacheKeys.labelKey(labelId), () => api.getLabel(labelId))
          .then(({ label }) => {
            const newOption = {
              value: label.id,
              label: formatLabelLabel(label),
            };
            if (!availableOptionsRegistry.current.has(newOption.value))
              availableOptionsRegistry.current.set(newOption.value, newOption);

            if (isMulti) {
              const currentValues = Array.isArray(value) ? value : [];
              if (!currentValues.some((val) => val === newOption.value)) {
                const newValues = [...currentValues, newOption.value];
                const newSelected = Array.isArray(selectedLabels) && [
                  ...selectedLabels,
                  newOption,
                ];
                onChange(newValues, newSelected);
              }
            } else {
              onChange(newOption.value, newOption);
            }
          })
          .catch(() => {
            snackbar('Failed to select label');
          });
      } else {
        setQuery(v);
      }
    };

    return (
      <Select
        {...rest}
        value={selectedLabels}
        ref={ref}
        onChange={handleOnChange}
        isMulti={isMulti}
        options={
          data?.labels &&
          data.labels.map((label) => ({
            value: label.id,
            label: formatLabelLabel(label),
          }))
        }
        placeholder={placeholder}
        inputValue={query}
        onInputChange={handleInputChange}
      />
    );
  },
);
