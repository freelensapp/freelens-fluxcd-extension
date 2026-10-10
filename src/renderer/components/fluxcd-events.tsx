import { Common, Renderer } from "@freelensapp/extensions";
import { computed, observable } from "mobx";
import * as MobxReact from "mobx-react";
import moment from "moment";
import React from "react";

const { observer } = MobxReact;

const {
  Component: {
    KubeObjectListLayout,
    Icon,
    KubeObjectAge,
    MaybeLink,
    NamespaceSelectBadge,
    WithTooltip,
    TabLayout,
    ReactiveDuration,
  },
  Navigation: { getDetailsUrl },
  K8sApi: { eventStore, apiManager },
} = Renderer;

const {
  Util: { cssNames, stopPropagation },
} = Common;

function isFluxCDEvent(event: Renderer.K8sApi.KubeEvent): boolean {
  return event?.involvedObject?.apiVersion?.includes(".toolkit.fluxcd.io/") ?? false;
}

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

type SortingCallback = (event: Renderer.K8sApi.KubeEvent) => string | number | undefined;

export interface FluxCDEventsProps {
  className?: string;
  compact?: boolean;
  compactLimit?: number;
}

@observer
export class FluxCDEvents extends React.Component<FluxCDEventsProps> {
  readonly sorting = observable.object({
    sortBy: columnId.age,
    orderBy: "asc" as "asc" | "desc",
  });

  private sortingCallbacks: Partial<Record<columnId, SortingCallback>> = {
    [columnId.namespace]: (event: Renderer.K8sApi.KubeEvent) => event.getNs(),
    [columnId.type]: (event: Renderer.K8sApi.KubeEvent) => event.type,
    [columnId.object]: (event: Renderer.K8sApi.KubeEvent) => event.involvedObject.name,
    [columnId.count]: (event: Renderer.K8sApi.KubeEvent) => event.count,
    [columnId.age]: (event: Renderer.K8sApi.KubeEvent) => -event.getCreationTimestamp(),
    [columnId.lastSeen]: (event: Renderer.K8sApi.KubeEvent) =>
      event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0,
  };

  @computed get items(): Renderer.K8sApi.KubeEvent[] {
    // Filter FIRST, then sort to maintain performance on large clusters
    const items = eventStore.contextItems.filter(isFluxCDEvent);
    const { sortBy, orderBy } = this.sorting;
    const sortingCallback = this.sortingCallbacks[sortBy];

    if (!sortingCallback) return items;

    return [...items].sort((a, b) => {
      const valA = sortingCallback(a) ?? "";
      const valB = sortingCallback(b) ?? "";
      if (valA === valB) return 0;
      const compare = valA > valB ? 1 : -1;
      return orderBy === "asc" ? compare : -compare;
    });
  }

  // The host calls `getItems` in a computed value of its list layout and `customizeHeader` in the render of its header,
  // and mobx-react 10 throws on a read of `this.props` in any derivation but this component's own render. So neither
  // reads `this.props`: `render()` passes them the props.
  private getVisibleItems(compact?: boolean, compactLimit?: number): Renderer.K8sApi.KubeEvent[] {
    if (compact) {
      return this.items.slice(0, compactLimit);
    }

    return this.items;
  }

  private customizeHeader({ info, title, ...headerPlaceholders }: any, compact?: boolean, compactLimit?: number) {
    const { items } = this;
    const visibleItems = this.getVisibleItems(compact, compactLimit);
    const allEventsAreShown = visibleItems.length === items.length;

    if (compact) {
      if (allEventsAreShown) {
        return { title };
      }

      return {
        title,
        info: (
          <span>
            {"("}
            {visibleItems.length}
            {" of "}
            {items.length}
            {")"}
          </span>
        ),
      };
    }

    return {
      info: (
        <>
          {info}
          <Icon small material="help_outline" className="help-icon" tooltip={`Limited to ${eventStore.limit}`} />
        </>
      ),
      title,
      ...headerPlaceholders,
    };
  }

  render() {
    const { compact, compactLimit, className, ...layoutProps } = this.props;

    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        isConfigurable
        tableId="fluxcd-events"
        store={eventStore}
        className={cssNames("Events", className, { compact })}
        renderHeaderTitle="FluxCD Events"
        customizeHeader={(header) => this.customizeHeader(header, compact, compactLimit)}
        isSelectable={false}
        getItems={() => this.getVisibleItems(compact, compactLimit)}
        virtual={!compact}
        tableProps={{
          sortSyncWithUrl: false,
          sortByDefault: this.sorting,
          onSort: (params) => Object.assign(this.sorting, params),
        }}
        sortingCallbacks={this.sortingCallbacks}
        searchFilters={[
          (event) => event.getSearchFields(),
          (event) => event.message,
          (event) => event.getSource(),
          (event) => event.involvedObject.name,
        ]}
        renderTableHeader={[
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Message", className: "message", id: columnId.message },
          {
            title: "Namespace",
            className: "namespace",
            sortBy: columnId.namespace,
            id: columnId.namespace,
          },
          {
            title: "Involved Object",
            className: "object",
            sortBy: columnId.object,
            id: columnId.object,
          },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          {
            title: "Last Seen",
            className: "last-seen",
            sortBy: columnId.lastSeen,
            id: columnId.lastSeen,
          },
        ]}
        renderTableContents={(event) => {
          const { involvedObject, type, message } = event;
          const isWarning = event.isWarning();

          return [
            <WithTooltip>{type}</WithTooltip>,
            {
              className: cssNames({ warning: isWarning }),
              title: <WithTooltip>{message}</WithTooltip>,
            },
            <NamespaceSelectBadge key="namespace" namespace={event.getNs()} />,
            <MaybeLink
              key="link"
              to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))}
              onClick={stopPropagation}
            >
              <WithTooltip>{`${involvedObject.kind}: ${involvedObject.name}`}</WithTooltip>
            </MaybeLink>,
            <WithTooltip>{event.getSource()}</WithTooltip>,
            event.count,
            <KubeObjectAge key="age" object={event} />,
            <WithTooltip tooltip={event.lastTimestamp ? moment(event.lastTimestamp).toDate() : undefined}>
              <ReactiveDuration key="last-seen" timestamp={event.lastTimestamp} />
            </WithTooltip>,
          ];
        }}
      />
    );

    if (compact) {
      return events;
    }

    return <TabLayout>{events}</TabLayout>;
  }
}
