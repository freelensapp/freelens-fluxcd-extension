// import { Renderer } from '@freelensapp/extensions'
import React from "react";
import "./pie-chart.scss";
// import { PieChartData } from '@freelensapp/extensions/dist/src/extensions/renderer-api/components'

// const getStats = (objects: Renderer.K8sApi.KubeObject[]) => {
//   const suspended = objects.filter((k) => k.spec.suspend === true).length
//   const ready = objects.filter(
//     (k) => !k.spec.suspend && k.status?.conditions?.find((c: any) => c.type === 'Ready').status === 'True'
//   ).length
//   const notReady = objects.filter(
//     (k) => !k.spec.suspend && k.status?.conditions?.find((c: any) => c.type === 'Ready').status === 'False'
//   ).length
//   const unknown = objects.filter((k) => !k.status?.conditions).length
//   const inProgress = objects.length - ready - notReady - suspended - unknown

//   return [ready, notReady, inProgress, suspended, unknown]
// }

// const getPath = (crd: Renderer.K8sApi.CustomResourceDefinition) => {
//   return crd.spec.names.plural
// }

// export interface PieChartProps<A extends Renderer.K8sApi.KubeObject> {
//   objects: A[]
//   title: string
//   crd: Renderer.K8sApi.CustomResourceDefinition
// }

// export function PieChart(props: PieChartProps<Renderer.K8sApi.KubeObject>): React.ReactElement {
//   const { objects, title, crd } = props
//   const [ready, notReady, inProgress, suspended, unknown] = getStats(objects)

//   const chartData: PieChartData = {
//     datasets: [
//       {
//         data: [ready, notReady, inProgress, suspended, unknown],
//         backgroundColor: ['#43a047', '#ce3933', '#FF6600', '#3d90ce', '#3a3a3c'],
//         tooltipLabels: [
//           (percent) => `Ready: ${percent}`,
//           (percent) => `Not Ready: ${percent}`,
//           (percent) => `In pogress: ${percent}`,
//           (percent) => `Suspended: ${percent}`,
//           (percent) => `Unknown: ${percent}`,
//         ],
//       },
//     ],

//     labels: [
//       `Ready: ${ready}`,
//       `Not Ready: ${notReady}`,
//       `In progress: ${inProgress}`,
//       `Suspended: ${suspended}`,
//       `Unknown: ${unknown}`,
//     ],
//   }

//   return (
//     <div className="chart-item">
//       <div className="chart-title center">
//         <a
//           onClick={(e) => {
//             e.preventDefault()
//             Renderer.Navigation.navigate({ pathname: getPath(crd) })
//           }}
//         >
//           {title}: {objects.length}
//         </a>
//       </div>
//       <Renderer.Component.PieChart data={chartData} />
//     </div>
//   )
// }

export function PieChart(/*props: PieChartProps<Renderer.K8sApi.KubeObject>*/): React.ReactElement {
  return <div>Pie Charts not working yet</div>;
}
